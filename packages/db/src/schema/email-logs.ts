import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const emailLogs = sqliteTable('email_logs', {
  apiKeyId: text('api_key_id'),
  apiKeyPrefix: text('api_key_prefix'),
  cloudflareMessageId: text('cloudflare_message_id'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  error: text('error'),
  fromAddress: text('from_address').notNull(),
  htmlBody: text('html_body'),
  id: text('id').primaryKey(),
  isTest: integer('is_test').notNull().default(0),
  status: text('status').notNull().default('sent'),
  subject: text('subject').notNull(),
  textBody: text('text_body'),
  toAddress: text('to_address').notNull(),
});
