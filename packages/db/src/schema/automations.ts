import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { projects } from './projects';

export const automationRunStatuses = [
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;

export type AutomationRunStatus = (typeof automationRunStatuses)[number];

export const automationStepStatuses = [
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
  'waiting',
] as const;

export type AutomationStepStatus = (typeof automationStepStatuses)[number];

export const automations = sqliteTable(
  'automations',
  {
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    graphJson: text('graph_json').notNull(),
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    publishedGraphJson: text('published_graph_json'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('automations_project_name_unique').on(
      table.projectId,
      table.name
    ),
  ]
);

export const automationRuns = sqliteTable('automation_runs', {
  automationId: text('automation_id')
    .notNull()
    .references(() => automations.id),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  currentNodeId: text('current_node_id'),
  graphJson: text('graph_json'),
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  recipientEmail: text('recipient_email').notNull(),
  status: text('status', { enum: automationRunStatuses }).notNull(),
  triggerEvent: text('trigger_event').notNull(),
  triggerPayloadJson: text('trigger_payload_json').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const automationStepRuns = sqliteTable('automation_step_runs', {
  branch: text('branch'),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  error: text('error'),
  id: text('id').primaryKey(),
  inputJson: text('input_json'),
  nodeId: text('node_id').notNull(),
  nodeType: text('node_type').notNull(),
  outputJson: text('output_json'),
  resumeAtMs: integer('resume_at_ms'),
  runId: text('run_id')
    .notNull()
    .references(() => automationRuns.id),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  status: text('status', { enum: automationStepStatuses }).notNull(),
  waitEvent: text('wait_event'),
});

export const automationEventIdempotency = sqliteTable(
  'automation_event_idempotency',
  {
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    eventName: text('event_name').notNull(),
    id: text('id').primaryKey(),
    idempotencyKey: text('idempotency_key').notNull(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id),
    recipientEmail: text('recipient_email').notNull(),
    responseJson: text('response_json').notNull(),
  },
  (table) => [
    uniqueIndex('automation_event_idempotency_unique').on(
      table.projectId,
      table.idempotencyKey
    ),
  ]
);
