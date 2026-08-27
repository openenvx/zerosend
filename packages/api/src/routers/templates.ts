import { renderEmailHtml } from '@openenvx/email/runtime';
import { ORPCError } from '@orpc/server';
import { templates } from '@zerosend/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { isUniqueConstraintError } from '../db/is-unique-constraint-error';
import { adminProcedure } from '../procedures';
import { htmlToText } from '../templates/html-to-text';

const MAX_SCENE_JSON_LENGTH = 2_000_000;
const MAX_TEMPLATE_NAME_LENGTH = 120;

function serializeTemplateListItem(row: {
  id: string;
  name: string;
  publishedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  };
}

function serializeTemplate(row: {
  createdAt: Date;
  htmlSnapshot: string | null;
  id: string;
  name: string;
  projectId: string;
  publishedAt: Date | null;
  sceneJson: string;
  textSnapshot: string | null;
  updatedAt: Date;
}) {
  return {
    createdAt: row.createdAt,
    htmlSnapshot: row.htmlSnapshot,
    id: row.id,
    name: row.name,
    projectId: row.projectId,
    publishedAt: row.publishedAt,
    sceneJson: row.sceneJson,
    textSnapshot: row.textSnapshot,
    updatedAt: row.updatedAt,
  };
}

export const templatesRouter = {
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(MAX_TEMPLATE_NAME_LENGTH),
        projectId: z.string().uuid(),
        sceneJson: z.string().min(2).max(MAX_SCENE_JSON_LENGTH),
      })
    )
    .handler(async ({ context, input }) => {
      const id = crypto.randomUUID();
      const now = new Date();

      try {
        await context.db.insert(templates).values({
          createdAt: now,
          htmlSnapshot: null,
          id,
          name: input.name,
          projectId: input.projectId,
          publishedAt: null,
          sceneJson: input.sceneJson,
          textSnapshot: null,
          updatedAt: now,
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ORPCError('CONFLICT', {
            message: 'A template with this name already exists in the project',
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
        .select({ id: templates.id })
        .from(templates)
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Template not found' });
      }

      await context.db
        .delete(templates)
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
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
        .from(templates)
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Template not found' });
      }

      return serializeTemplate(row);
    }),

  list: adminProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const rows = await context.db
        .select({
          id: templates.id,
          name: templates.name,
          publishedAt: templates.publishedAt,
          updatedAt: templates.updatedAt,
        })
        .from(templates)
        .where(eq(templates.projectId, input.projectId))
        .orderBy(desc(templates.updatedAt));

      return rows.map(serializeTemplateListItem);
    }),

  publish: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        sceneJson: z.string().trim().min(2).max(MAX_SCENE_JSON_LENGTH),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({ id: templates.id })
        .from(templates)
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Template not found' });
      }

      const htmlSnapshot = await renderEmailHtml(JSON.parse(input.sceneJson));
      const textSnapshot = htmlToText(htmlSnapshot);
      const now = new Date();

      await context.db
        .update(templates)
        .set({
          htmlSnapshot,
          publishedAt: now,
          textSnapshot,
          updatedAt: now,
        })
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
          )
        );

      return {
        id: input.id,
        publishedAt: now,
        updatedAt: now,
      };
    }),

  saveScene: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        sceneJson: z.string().min(2).max(MAX_SCENE_JSON_LENGTH),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({ id: templates.id })
        .from(templates)
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Template not found' });
      }

      const now = new Date();

      await context.db
        .update(templates)
        .set({
          sceneJson: input.sceneJson,
          updatedAt: now,
        })
        .where(
          and(
            eq(templates.id, input.id),
            eq(templates.projectId, input.projectId)
          )
        );

      return {
        id: input.id,
        updatedAt: now,
      };
    }),
};
