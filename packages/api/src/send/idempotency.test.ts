import { describe, expect, it } from 'vitest';

import {
  beginIdempotency,
  completeIdempotency,
  hashSendRequestBody,
  IDEMPOTENCY_IN_PROGRESS_STATUS,
  IDEMPOTENCY_IN_PROGRESS_TTL_MS,
  lookupIdempotency,
  reserveIdempotency,
} from './idempotency';

interface IdempotencyRow {
  apiKeyId: string;
  idempotencyKey: string;
  requestHash: string;
  statusCode: number;
  body: string;
  createdAt: Date;
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
          'statusCode' | 'body' | 'createdAt' | 'requestHash'
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
  } as unknown as Parameters<typeof beginIdempotency>[0];

  return { mockDb, rows };
}

describe('hashSendRequestBody', () => {
  it('is stable for equivalent recipient lists', async () => {
    const first = await hashSendRequestBody({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to: ['User@Example.com', 'other@example.com'],
    });
    const second = await hashSendRequestBody({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to: ['other@example.com', 'user@example.com'],
    });

    expect(first).toBe(second);
  });
});

describe('lookupIdempotency', () => {
  it('continues when the key is new', async () => {
    const { mockDb } = createIdempotencyDb();

    const result = await lookupIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      Date.now()
    );

    expect(result).toEqual({ type: 'continue', reclaim: false });
  });

  it('replays completed requests with the same hash', async () => {
    const { mockDb } = createIdempotencyDb();
    const nowMs = Date.now();

    await reserveIdempotency(mockDb, 'key-1', 'idem-1', 'hash-1', nowMs, false);
    await completeIdempotency(mockDb, 'key-1', 'idem-1', 200, {
      id: 'log-1',
    });

    const replay = await lookupIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs
    );

    expect(replay).toEqual({
      type: 'replay',
      statusCode: 200,
      body: { id: 'log-1' },
    });
  });

  it('returns error when stored replay body is invalid JSON', async () => {
    const { mockDb, rows } = createIdempotencyDb();
    const nowMs = Date.now();

    rows.set('key-1:idem-1', {
      apiKeyId: 'key-1',
      body: '{not-json',
      createdAt: new Date(nowMs),
      idempotencyKey: 'idem-1',
      requestHash: 'hash-1',
      statusCode: 200,
    });

    const result = await lookupIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs
    );

    expect(result).toEqual({
      type: 'error',
      message: 'Stored idempotency response is invalid',
    });
  });
});

describe('beginIdempotency', () => {
  it('allows the first request to proceed', async () => {
    const { mockDb } = createIdempotencyDb();

    const result = await beginIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      Date.now()
    );

    expect(result).toEqual({ type: 'proceed' });
  });

  it('replays completed requests with the same hash', async () => {
    const { mockDb } = createIdempotencyDb();
    const nowMs = Date.now();

    await beginIdempotency(mockDb, 'key-1', 'idem-1', 'hash-1', nowMs);
    await completeIdempotency(mockDb, 'key-1', 'idem-1', 200, {
      id: 'log-1',
    });

    const replay = await beginIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs
    );

    expect(replay).toEqual({
      type: 'replay',
      statusCode: 200,
      body: { id: 'log-1' },
    });
  });

  it('returns conflict for different request hashes', async () => {
    const { mockDb } = createIdempotencyDb();
    const nowMs = Date.now();

    await beginIdempotency(mockDb, 'key-1', 'idem-1', 'hash-1', nowMs);
    await completeIdempotency(mockDb, 'key-1', 'idem-1', 200, {
      id: 'log-1',
    });

    const conflict = await beginIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-2',
      nowMs
    );

    expect(conflict).toEqual({
      type: 'conflict',
      message: 'Idempotency key conflict',
    });
  });

  it('returns conflict while a request is in progress', async () => {
    const { mockDb } = createIdempotencyDb();
    const nowMs = Date.now();

    await beginIdempotency(mockDb, 'key-1', 'idem-1', 'hash-1', nowMs);

    const conflict = await beginIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs
    );

    expect(conflict).toEqual({
      type: 'conflict',
      message: 'A request with this Idempotency-Key is already in progress',
    });
    expect(IDEMPOTENCY_IN_PROGRESS_STATUS).toBe(0);
  });

  it('reclaims expired in-progress keys with the same hash', async () => {
    const { mockDb, rows } = createIdempotencyDb();
    const nowMs = Date.now();
    const expiredMs = nowMs - IDEMPOTENCY_IN_PROGRESS_TTL_MS - 1;

    await reserveIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      expiredMs,
      false
    );
    const row = rows.get('key-1:idem-1');
    if (row) {
      row.createdAt = new Date(expiredMs);
    }

    const lookup = await lookupIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs
    );
    expect(lookup).toEqual({ type: 'continue', reclaim: true });

    const reserve = await reserveIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs,
      true
    );
    expect(reserve).toEqual({ type: 'reserved' });
  });

  it('returns conflict when insert races on an in-progress key', async () => {
    const { mockDb } = createIdempotencyDb();
    const nowMs = Date.now();

    await reserveIdempotency(mockDb, 'key-1', 'idem-1', 'hash-1', nowMs, false);

    const result = await reserveIdempotency(
      mockDb,
      'key-1',
      'idem-1',
      'hash-1',
      nowMs,
      false
    );

    expect(result).toEqual({
      type: 'conflict',
      message: 'A request with this Idempotency-Key is already in progress',
    });
  });

  it('returns error when insert fails without a unique constraint', async () => {
    const { mockDb } = createIdempotencyDb();
    const failingDb = {
      ...mockDb,
      insert: () => ({
        values: () => {
          throw new Error('SQLITE_BUSY');
        },
      }),
    } as unknown as Parameters<typeof reserveIdempotency>[0];

    const result = await reserveIdempotency(
      failingDb,
      'key-1',
      'idem-1',
      'hash-1',
      Date.now(),
      false
    );

    expect(result).toEqual({
      type: 'error',
      message: 'Failed to reserve idempotency key',
    });
  });
});
