import type { createDb } from '@zerosend/db';
import { idempotencyKeys } from '@zerosend/db/schema';
import { and, eq } from 'drizzle-orm';

import type { SendEmailInput } from './send-email-input';

type Db = ReturnType<typeof createDb>;

export const IDEMPOTENCY_KEY_MAX_LENGTH = 256;
export const IDEMPOTENCY_IN_PROGRESS_STATUS = 0;
export const IDEMPOTENCY_IN_PROGRESS_TTL_MS = 60 * 60 * 1000;

export type IdempotencyLookupResult =
  | { type: 'continue'; reclaim: boolean }
  | {
      type: 'replay';
      statusCode: number;
      body: Record<string, unknown>;
    }
  | {
      type: 'conflict';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

export type IdempotencyReserveResult =
  | { type: 'reserved' }
  | {
      type: 'conflict';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

export async function hashSendRequestBody(
  input: SendEmailInput
): Promise<string> {
  const recipients = input.to.map((address) => address.toLowerCase());
  recipients.sort((a, b) => a.localeCompare(b));

  const canonical = {
    from: input.from ?? null,
    fromName: input.fromName ?? null,
    html: input.html ?? null,
    replyTo: input.replyTo ?? null,
    subject: input.subject,
    text: input.text ?? null,
    to: recipients,
  };

  const bytes = new TextEncoder().encode(JSON.stringify(canonical));
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isUniqueConstraintError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('UNIQUE constraint failed');
  }

  return false;
}

function isInProgressExpired(createdAt: Date, nowMs: number): boolean {
  return nowMs - createdAt.getTime() > IDEMPOTENCY_IN_PROGRESS_TTL_MS;
}

async function loadIdempotencyRow(
  db: Db,
  apiKeyId: string,
  idempotencyKey: string
) {
  const [row] = await db
    .select()
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.apiKeyId, apiKeyId),
        eq(idempotencyKeys.idempotencyKey, idempotencyKey)
      )
    )
    .limit(1);

  return row;
}

export async function lookupIdempotency(
  db: Db,
  apiKeyId: string,
  idempotencyKey: string,
  requestHash: string,
  nowMs: number
): Promise<IdempotencyLookupResult> {
  const existing = await loadIdempotencyRow(db, apiKeyId, idempotencyKey);

  if (!existing) {
    return { type: 'continue', reclaim: false };
  }

  if (existing.statusCode === IDEMPOTENCY_IN_PROGRESS_STATUS) {
    if (isInProgressExpired(existing.createdAt, nowMs)) {
      if (existing.requestHash !== requestHash) {
        return {
          type: 'conflict',
          message: 'Idempotency key conflict',
        };
      }

      return { type: 'continue', reclaim: true };
    }

    if (existing.requestHash === requestHash) {
      return {
        type: 'conflict',
        message: 'A request with this Idempotency-Key is already in progress',
      };
    }

    return {
      type: 'conflict',
      message: 'Idempotency key conflict',
    };
  }

  if (existing.requestHash !== requestHash) {
    return {
      type: 'conflict',
      message: 'Idempotency key conflict',
    };
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(existing.body) as Record<string, unknown>;
  } catch {
    return {
      type: 'error',
      message: 'Stored idempotency response is invalid',
    };
  }

  return {
    type: 'replay',
    statusCode: existing.statusCode,
    body,
  };
}

export async function reserveIdempotency(
  db: Db,
  apiKeyId: string,
  idempotencyKey: string,
  requestHash: string,
  nowMs: number,
  reclaim: boolean
): Promise<IdempotencyReserveResult> {
  const now = new Date(nowMs);

  if (reclaim) {
    await db
      .update(idempotencyKeys)
      .set({
        body: '',
        createdAt: now,
        requestHash,
        statusCode: IDEMPOTENCY_IN_PROGRESS_STATUS,
      })
      .where(
        and(
          eq(idempotencyKeys.apiKeyId, apiKeyId),
          eq(idempotencyKeys.idempotencyKey, idempotencyKey),
          eq(idempotencyKeys.statusCode, IDEMPOTENCY_IN_PROGRESS_STATUS)
        )
      );

    const reclaimed = await loadIdempotencyRow(db, apiKeyId, idempotencyKey);
    if (
      !reclaimed ||
      reclaimed.statusCode !== IDEMPOTENCY_IN_PROGRESS_STATUS ||
      reclaimed.requestHash !== requestHash
    ) {
      return {
        type: 'error',
        message: 'Failed to reclaim idempotency key',
      };
    }

    return { type: 'reserved' };
  }

  try {
    await db.insert(idempotencyKeys).values({
      apiKeyId,
      body: '',
      createdAt: now,
      idempotencyKey,
      requestHash,
      statusCode: IDEMPOTENCY_IN_PROGRESS_STATUS,
    });

    return { type: 'reserved' };
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      return {
        type: 'error',
        message: 'Failed to reserve idempotency key',
      };
    }

    const existing = await loadIdempotencyRow(db, apiKeyId, idempotencyKey);
    if (!existing) {
      return {
        type: 'error',
        message: 'Failed to reserve idempotency key',
      };
    }

    if (existing.statusCode === IDEMPOTENCY_IN_PROGRESS_STATUS) {
      if (existing.requestHash === requestHash) {
        return {
          type: 'conflict',
          message: 'A request with this Idempotency-Key is already in progress',
        };
      }

      return {
        type: 'conflict',
        message: 'Idempotency key conflict',
      };
    }

    return {
      type: 'conflict',
      message: 'Idempotency key conflict',
    };
  }
}

export async function completeIdempotency(
  db: Db,
  apiKeyId: string,
  idempotencyKey: string,
  statusCode: number,
  body: Record<string, unknown>
): Promise<void> {
  await db
    .update(idempotencyKeys)
    .set({
      body: JSON.stringify(body),
      statusCode,
    })
    .where(
      and(
        eq(idempotencyKeys.apiKeyId, apiKeyId),
        eq(idempotencyKeys.idempotencyKey, idempotencyKey)
      )
    );
}

// Kept for tests that exercise the combined flow.
export type IdempotencyBeginResult =
  | { type: 'proceed' }
  | {
      type: 'replay';
      statusCode: number;
      body: Record<string, unknown>;
    }
  | {
      type: 'conflict';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

export async function beginIdempotency(
  db: Db,
  apiKeyId: string,
  idempotencyKey: string,
  requestHash: string,
  nowMs: number
): Promise<IdempotencyBeginResult> {
  const lookup = await lookupIdempotency(
    db,
    apiKeyId,
    idempotencyKey,
    requestHash,
    nowMs
  );

  if (lookup.type !== 'continue') {
    return lookup;
  }

  const reserve = await reserveIdempotency(
    db,
    apiKeyId,
    idempotencyKey,
    requestHash,
    nowMs,
    lookup.reclaim
  );

  if (reserve.type === 'conflict' || reserve.type === 'error') {
    return reserve;
  }

  return { type: 'proceed' };
}
