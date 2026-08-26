import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const domains = sqliteTable('domains', {
  cfSubdomainId: text('cf_subdomain_id'),
  cfZoneId: text('cf_zone_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  dkimSelector: text('dkim_selector'),
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  returnPathDomain: text('return_path_domain'),
  verified: integer('verified').notNull().default(0),
});
