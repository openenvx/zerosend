import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const DEFAULT_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
export const DEFAULT_PROJECT_NAME = 'Default';

export const projects = sqliteTable('projects', {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
});
