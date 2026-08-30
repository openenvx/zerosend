import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { projects } from './projects';

export const templates = sqliteTable(
  'templates',
  {
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    htmlSnapshot: text('html_snapshot'),
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    name: text('name').notNull(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    sceneJson: text('scene_json').notNull(),
    textSnapshot: text('text_snapshot'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('templates_project_key_unique').on(table.projectId, table.key),
    uniqueIndex('templates_project_name_unique').on(
      table.projectId,
      table.name
    ),
  ]
);
