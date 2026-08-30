import { ORPCError } from '@orpc/server';
import {
  automationRuns,
  automationStepRuns,
  automations,
} from '@zerosend/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import {
  MAX_GRAPH_JSON_LENGTH,
  parseAutomationGraph,
  serializeAutomationGraph,
} from '../automations/graph-schema';
import { ingestAutomationEvent } from '../automations/ingest-event';
import { getStarterTemplate } from '../automations/starter-graphs';
import { validateAutomationGraph } from '../automations/validate-graph';
import { isUniqueConstraintError } from '../db/is-unique-constraint-error';
import { adminProcedure } from '../procedures';

const MAX_AUTOMATION_NAME_LENGTH = 120;

function serializeAutomationListItem(row: {
  id: string;
  name: string;
  publishedAt: Date | null;
  updatedAt: Date;
  runCount: number;
}) {
  return {
    id: row.id,
    name: row.name,
    publishedAt: row.publishedAt,
    runCount: row.runCount,
    updatedAt: row.updatedAt,
  };
}

function serializeAutomation(row: {
  createdAt: Date;
  graphJson: string;
  id: string;
  name: string;
  projectId: string;
  publishedAt: Date | null;
  publishedGraphJson: string | null;
  updatedAt: Date;
}) {
  return {
    createdAt: row.createdAt,
    graphJson: row.graphJson,
    id: row.id,
    name: row.name,
    projectId: row.projectId,
    publishedAt: row.publishedAt,
    publishedGraphJson: row.publishedGraphJson,
    updatedAt: row.updatedAt,
  };
}

const emptyGraph = serializeAutomationGraph({
  edges: [],
  nodes: [
    {
      data: { eventName: 'user.signup' },
      id: 'trigger',
      position: { x: 0, y: 120 },
      type: 'trigger',
    },
  ],
});

export const automationsRouter = {
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(MAX_AUTOMATION_NAME_LENGTH),
        projectId: z.string().uuid(),
        starterTemplateId: z.string().trim().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const starter = input.starterTemplateId
        ? getStarterTemplate(input.starterTemplateId)
        : undefined;

      const graphJson = starter
        ? serializeAutomationGraph(starter.graph)
        : emptyGraph;

      const id = crypto.randomUUID();
      const now = new Date();

      try {
        await context.db.insert(automations).values({
          createdAt: now,
          graphJson,
          id,
          name: input.name,
          projectId: input.projectId,
          publishedAt: null,
          publishedGraphJson: null,
          updatedAt: now,
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ORPCError('CONFLICT', {
            message:
              'An automation with this name already exists in the project',
          });
        }

        throw error;
      }

      return {
        createdAt: now,
        id,
        name: input.name,
        projectId: input.projectId,
        publishedAt: null,
        updatedAt: now,
      };
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({ id: automations.id })
        .from(automations)
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Automation not found' });
      }

      await context.db
        .delete(automations)
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        );

      return { ok: true as const };
    }),

  get: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select()
        .from(automations)
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Automation not found' });
      }

      return serializeAutomation(row);
    }),

  list: adminProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const rows = await context.db
        .select({
          createdAt: automations.createdAt,
          id: automations.id,
          name: automations.name,
          publishedAt: automations.publishedAt,
          runCount: sql<number>`coalesce(count(${automationRuns.id}), 0)`,
          updatedAt: automations.updatedAt,
        })
        .from(automations)
        .leftJoin(
          automationRuns,
          eq(automationRuns.automationId, automations.id)
        )
        .where(eq(automations.projectId, input.projectId))
        .groupBy(automations.id)
        .orderBy(desc(automations.updatedAt));

      return rows.map(serializeAutomationListItem);
    }),

  listStarters: adminProcedure.handler(async () => {
    const { createStarterTemplates } =
      await import('../automations/starter-graphs');
    return createStarterTemplates().map((starter) => ({
      description: starter.description,
      id: starter.id,
      name: starter.name,
    }));
  }),

  publish: adminProcedure
    .input(
      z.object({
        graphJson: z.string().min(2).max(MAX_GRAPH_JSON_LENGTH),
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({ id: automations.id })
        .from(automations)
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Automation not found' });
      }

      const graph = parseAutomationGraph(input.graphJson);
      const validation = validateAutomationGraph(graph, { forPublish: true });
      if (!validation.valid) {
        throw new ORPCError('BAD_REQUEST', {
          message: validation.issues[0]?.message ?? 'Invalid automation graph',
        });
      }

      const now = new Date();

      await context.db
        .update(automations)
        .set({
          graphJson: input.graphJson,
          publishedAt: now,
          publishedGraphJson: input.graphJson,
          updatedAt: now,
        })
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        );

      return {
        id: input.id,
        publishedAt: now,
        updatedAt: now,
      };
    }),

  runGet: adminProcedure
    .input(
      z.object({
        automationId: z.string().uuid(),
        projectId: z.string().uuid(),
        runId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [run] = await context.db
        .select()
        .from(automationRuns)
        .where(
          and(
            eq(automationRuns.id, input.runId),
            eq(automationRuns.automationId, input.automationId),
            eq(automationRuns.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!run) {
        throw new ORPCError('NOT_FOUND', { message: 'Run not found' });
      }

      const steps = await context.db
        .select()
        .from(automationStepRuns)
        .where(eq(automationStepRuns.runId, input.runId))
        .orderBy(automationStepRuns.createdAt);

      return {
        completedAt: run.completedAt,
        createdAt: run.createdAt,
        currentNodeId: run.currentNodeId,
        id: run.id,
        recipientEmail: run.recipientEmail,
        status: run.status,
        steps: steps.map((step) => ({
          branch: step.branch,
          completedAt: step.completedAt,
          error: step.error,
          id: step.id,
          nodeId: step.nodeId,
          nodeType: step.nodeType,
          outputJson: step.outputJson,
          resumeAtMs: step.resumeAtMs,
          startedAt: step.startedAt,
          status: step.status,
          waitEvent: step.waitEvent,
        })),
        triggerEvent: run.triggerEvent,
        triggerPayloadJson: run.triggerPayloadJson,
        updatedAt: run.updatedAt,
      };
    }),

  runsList: adminProcedure
    .input(
      z.object({
        automationId: z.string().uuid(),
        limit: z.number().int().min(1).max(100).default(50),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const rows = await context.db
        .select({
          completedAt: automationRuns.completedAt,
          createdAt: automationRuns.createdAt,
          id: automationRuns.id,
          recipientEmail: automationRuns.recipientEmail,
          status: automationRuns.status,
          triggerEvent: automationRuns.triggerEvent,
          updatedAt: automationRuns.updatedAt,
        })
        .from(automationRuns)
        .where(
          and(
            eq(automationRuns.automationId, input.automationId),
            eq(automationRuns.projectId, input.projectId)
          )
        )
        .orderBy(desc(automationRuns.createdAt))
        .limit(input.limit);

      return rows;
    }),

  saveGraph: adminProcedure
    .input(
      z.object({
        graphJson: z.string().min(2).max(MAX_GRAPH_JSON_LENGTH),
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({ id: automations.id })
        .from(automations)
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Automation not found' });
      }

      const graph = parseAutomationGraph(input.graphJson);
      const validation = validateAutomationGraph(graph, { forPublish: false });
      if (!validation.valid) {
        throw new ORPCError('BAD_REQUEST', {
          message: validation.issues[0]?.message ?? 'Invalid automation graph',
        });
      }

      const now = new Date();

      await context.db
        .update(automations)
        .set({
          graphJson: input.graphJson,
          updatedAt: now,
        })
        .where(
          and(
            eq(automations.id, input.id),
            eq(automations.projectId, input.projectId)
          )
        );

      return {
        id: input.id,
        updatedAt: now,
      };
    }),

  testEvent: adminProcedure
    .input(
      z.object({
        automationId: z.string().uuid(),
        email: z.string().email(),
        event: z.string().trim().min(1).max(120),
        payload: z.record(z.string(), z.unknown()).optional(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [automation] = await context.db
        .select({ id: automations.id })
        .from(automations)
        .where(
          and(
            eq(automations.id, input.automationId),
            eq(automations.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!automation) {
        throw new ORPCError('NOT_FOUND', { message: 'Automation not found' });
      }

      const result = await ingestAutomationEvent(
        context.db,
        input.projectId,
        {
          email: input.email,
          event: input.event,
          payload: input.payload,
        },
        {
          keyType: 'test',
          nowMs: Date.now(),
        }
      );

      return result;
    }),
};
