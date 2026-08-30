import { renderEmailHtml } from '@openenvx/email-studio/runtime';
import { ORPCError } from '@orpc/server';
import { templates } from '@zerosend/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { isUniqueConstraintError } from '../db/is-unique-constraint-error';
import { adminProcedure } from '../procedures';
import { htmlToText } from '../templates/html-to-text';
import { templateKeySchema } from '../templates/template-key';

const MAX_SCENE_JSON_LENGTH = 2_000_000;
const MAX_TEMPLATE_NAME_LENGTH = 120;

function serializeTemplateListItem(row: {
  id: string;
  key: string;
  name: string;
  publishedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  };
}

function serializeTemplate(row: {
  createdAt: Date;
  htmlSnapshot: string | null;
  id: string;
  key: string;
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
    key: row.key,
    name: row.name,
    projectId: row.projectId,
    publishedAt: row.publishedAt,
    sceneJson: row.sceneJson,
    textSnapshot: row.textSnapshot,
    updatedAt: row.updatedAt,
  };
}

function mapTemplateConflictError(error: unknown): never {
  if (isUniqueConstraintError(error)) {
    throw new ORPCError('CONFLICT', {
      message: 'A template with this name or key already exists in the project',
    });
  }

  throw error;
}

export const templatesRouter = {
  create: adminProcedure
    .input(
      z.object({
        key: templateKeySchema,
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
          key: input.key,
          name: input.name,
          projectId: input.projectId,
          publishedAt: null,
          sceneJson: input.sceneJson,
          textSnapshot: null,
          updatedAt: now,
        });
      } catch (error) {
        mapTemplateConflictError(error);
      }

      return {
        createdAt: now,
        id,
        key: input.key,
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
          key: templates.key,
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

  updateMeta: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        key: templateKeySchema,
        name: z.string().trim().min(1).max(MAX_TEMPLATE_NAME_LENGTH),
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

      const now = new Date();

      try {
        await context.db
          .update(templates)
          .set({
            key: input.key,
            name: input.name,
            updatedAt: now,
          })
          .where(
            and(
              eq(templates.id, input.id),
              eq(templates.projectId, input.projectId)
            )
          );
      } catch (error) {
        mapTemplateConflictError(error);
      }

      return {
        id: input.id,
        key: input.key,
        name: input.name,
        updatedAt: now,
      };
    }),
};
