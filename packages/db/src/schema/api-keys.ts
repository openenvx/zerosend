import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const apiKeys = sqliteTable('api_keys', {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  id: text('id').primaryKey(),
  keyHash: text('key_hash').notNull().unique(),
  keyType: text('key_type', { enum: ['test', 'live'] })
    .notNull()
    .default('test'),
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
  revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
  scopes: text('scopes').notNull().default('["send"]'),
});

export const settings = sqliteTable('settings', {
  defaultFrom: text('default_from'),
  id: text('id').primaryKey(),
});
