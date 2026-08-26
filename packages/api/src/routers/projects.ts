import { ORPCError } from '@orpc/server';
import type { createDb } from '@zerosend/db';
import { DEFAULT_PROJECT_ID, projects } from '@zerosend/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { isUniqueConstraintError } from '../db/is-unique-constraint-error';
import { adminProcedure } from '../procedures';
import {
  getStoredCurrentProjectId,
  setStoredCurrentProjectId,
} from '../settings/instance-settings';

function serializeProject(row: typeof projects.$inferSelect) {
  return {
    createdAt: row.createdAt,
    id: row.id,
    name: row.name,
  };
}

export const projectsRouter = {
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
      })
    )
    .handler(async ({ context, input }) => {
      const id = crypto.randomUUID();
      const now = new Date();

      try {
        await context.db.insert(projects).values({
          createdAt: now,
          id,
          name: input.name,
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ORPCError('CONFLICT', {
            message: 'A project with this name already exists',
          });
        }

        throw error;
      }

      return serializeProject({
        createdAt: now,
        id,
        name: input.name,
      });
    }),

  list: adminProcedure.handler(async ({ context }) => {
    const rows = await context.db
      .select()
      .from(projects)
      .orderBy(asc(projects.createdAt));

    return rows.map(serializeProject);
  }),

  setCurrent: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Project not found' });
      }

      await setStoredCurrentProjectId(context.db, input.id);

      return serializeProject(row);
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(120),
      })
    )
    .handler(async ({ context, input }) => {
      try {
        await context.db
          .update(projects)
          .set({ name: input.name })
          .where(eq(projects.id, input.id));
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ORPCError('CONFLICT', {
            message: 'A project with this name already exists',
          });
        }

        throw error;
      }

      const [row] = await context.db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Project not found' });
      }

      return serializeProject(row);
    }),
};

export async function resolveCurrentProject(
  db: ReturnType<typeof createDb>,
  rows?: (typeof projects.$inferSelect)[]
) {
  const projectRows =
    rows ?? (await db.select().from(projects).orderBy(asc(projects.createdAt)));

  if (projectRows.length === 0) {
    return null;
  }

  const storedId = await getStoredCurrentProjectId(db);
  if (storedId) {
    const matched = projectRows.find((row) => row.id === storedId);
    if (matched) {
      return serializeProject(matched);
    }
  }

  const defaultProject = projectRows.find(
    (row) => row.id === DEFAULT_PROJECT_ID
  );
  if (defaultProject) {
    return serializeProject(defaultProject);
  }

  return serializeProject(projectRows[0]!);
}
