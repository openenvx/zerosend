import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@zerosend/env/server', () => ({
  env: {
    EMAIL: undefined,
    RATE_LIMIT_KV: undefined,
  },
}));

import type { ApiKeyPrincipal } from '../auth/types';
import { hashSendRequestBody } from '../send/idempotency';
import * as kvRateLimitModule from '../send/kv-rate-limiter';
import { createMemoryKvNamespace } from '../send/kv-rate-limiter';
import { getRateLimitWindowStart, SEND_RATE_LIMIT } from '../send/rate-limit';
import { sendEmail } from '../send/send-email';
import { createV1Context } from '../v1-context';
import { createV1OpenAPIHandler } from './handler';

vi.mock('../send/send-email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../send/send-email')>();
  return {
    ...actual,
    sendEmail: vi.fn(),
  };
});

const TEST_PROJECT_ID = '00000000-0000-4000-8000-000000000001';

const testPrincipal: ApiKeyPrincipal = {
  id: 'key-1',
  keyPrefix: 'zs_test_abcd1234',
  keyType: 'test',
  kind: 'api_key',
  projectId: TEST_PROJECT_ID,
  scopes: ['send'],
};

const fixedNowMs = 1_700_000_000_000;

interface IdempotencyRow {
  apiKeyId: string;
  body: string;
  createdAt: Date;
  idempotencyKey: string;
  requestHash: string;
  statusCode: number;
}

function createIdempotencyDb() {
  const rows = new Map<string, IdempotencyRow>();

  const rowKey = (apiKeyId: string, idempotencyKey: string) =>
    `${apiKeyId}:${idempotencyKey}`;

  const mockDb = {
    insert: () => ({
      values: (values: IdempotencyRow) => {
        const key = rowKey(values.apiKeyId, values.idempotencyKey);
        if (rows.has(key)) {
          throw new Error('UNIQUE constraint failed');
        }

        rows.set(key, values);
        return Promise.resolve();
      },
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => {
            const last = [...rows.values()].at(-1);
            return Promise.resolve(last ? [last] : []);
          },
        }),
      }),
    }),
    update: () => ({
      set: (
        values: Pick<
          IdempotencyRow,
          'body' | 'createdAt' | 'requestHash' | 'statusCode'
        >
      ) => ({
        where: () => {
          const last = [...rows.values()].at(-1);
          if (last) {
            Object.assign(last, values);
          }

          return Promise.resolve();
        },
      }),
    }),
  };

  return { mockDb, rows };
}

async function handleV1(
  request: Request,
  options: {
    db?: object;
    principal?: ApiKeyPrincipal | null;
    rateLimitKv?: KVNamespace;
  } = {}
) {
  const handler = createV1OpenAPIHandler();
  const result = await handler.handle(request, {
    context: await createV1Context({
      db: options.db as never,
      now: () => fixedNowMs,
      principal:
        options.principal === undefined ? testPrincipal : options.principal,
      rateLimitKv: options.rateLimitKv ?? createMemoryKvNamespace(),
      req: request,
    }),
    prefix: '/v1',
  });

  if (!result.matched || !result.response) {
    throw new Error('Expected a matched v1 response');
  }

  return result.response;
}

const validEmailBody = {
  from: 'hello@example.com',
  html: '<p>Hi</p>',
  subject: 'Hello',
  to: ['user@example.com'],
};

describe('v1 OpenAPI handler', () => {
  beforeEach(() => {
    vi.mocked(sendEmail).mockReset();
    vi.mocked(sendEmail).mockResolvedValue({ id: 'log-123' });
  });

  it('returns 401 without an API key principal', async () => {
    const response = await handleV1(
      new Request('http://localhost/v1/me', { method: 'GET' }),
      { principal: null }
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(response.headers.get('X-RateLimit-Limit')).toBeNull();
  });

  it('returns the authenticated key from GET /v1/me', async () => {
    const response = await handleV1(
      new Request('http://localhost/v1/me', { method: 'GET' })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: testPrincipal.id,
      keyType: testPrincipal.keyType,
      kind: testPrincipal.kind,
      projectId: testPrincipal.projectId,
      scopes: testPrincipal.scopes,
    });
  });

  it('returns 403 when the key lacks send scope', async () => {
    const response = await handleV1(
      new Request('http://localhost/v1/emails', {
        body: JSON.stringify(validEmailBody),
        headers: {
          Authorization: 'Bearer zs_test_example',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
      {
        principal: { ...testPrincipal, scopes: [] },
      }
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
  });

  it('returns 400 for invalid request bodies', async () => {
    const response = await handleV1(
      new Request('http://localhost/v1/emails', {
        body: JSON.stringify({
          from: 'hello@example.com',
          subject: 'Hello',
          to: 'user@example.com',
        }),
        headers: {
          Authorization: 'Bearer zs_test_example',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    );

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error.length).toBeGreaterThan(0);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
  });

  it('returns 429 when the per-key limit is exceeded', async () => {
    const rateLimitKv = createMemoryKvNamespace();
    const windowStart = getRateLimitWindowStart(fixedNowMs);
    await rateLimitKv.put(
      `rl:${testPrincipal.id}:${windowStart}`,
      String(SEND_RATE_LIMIT),
      { expirationTtl: 60 }
    );

    const response = await handleV1(
      new Request('http://localhost/v1/emails', {
        body: JSON.stringify(validEmailBody),
        headers: {
          Authorization: 'Bearer zs_test_example',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
      { rateLimitKv }
    );

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'Rate limit exceeded' });
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('sends email successfully from POST /v1/emails', async () => {
    const response = await handleV1(
      new Request('http://localhost/v1/emails', {
        body: JSON.stringify(validEmailBody),
        headers: {
          Authorization: 'Bearer zs_test_example',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'log-123' });
    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(sendEmail).toHaveBeenCalledOnce();
  });

  it('replays idempotent requests without consuming another rate limit', async () => {
    const { mockDb, rows } = createIdempotencyDb();
    const incrementSpy = vi.spyOn(kvRateLimitModule, 'consumeApiKeyRateLimit');

    rows.set(`${testPrincipal.id}:idem-1`, {
      apiKeyId: testPrincipal.id,
      body: JSON.stringify({ id: 'stored-log' }),
      createdAt: new Date(fixedNowMs),
      idempotencyKey: 'idem-1',
      requestHash: await hashSendRequestBody(validEmailBody),
      statusCode: 200,
    });

    const response = await handleV1(
      new Request('http://localhost/v1/emails', {
        body: JSON.stringify(validEmailBody),
        headers: {
          Authorization: 'Bearer zs_test_example',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idem-1',
        },
        method: 'POST',
      }),
      { db: mockDb }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'stored-log' });
    expect(incrementSpy).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();

    incrementSpy.mockRestore();
  });
});
