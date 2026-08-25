import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const idempotencyKeys = sqliteTable(
  'idempotency_keys',
  {
    apiKeyId: text('api_key_id').notNull(),
    body: text('body').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    requestHash: text('request_hash').notNull(),
    statusCode: integer('status_code').notNull(),
  },
  (table) => ({
    apiKeyIdempotencyKeyUnique: unique().on(
      table.apiKeyId,
      table.idempotencyKey
    ),
  })
);
