import type { createDb } from '@zerosend/db';
import { projects } from '@zerosend/db/schema';
import { asc } from 'drizzle-orm';

import { resolveCurrentProject } from '../routers/projects';

type Db = ReturnType<typeof createDb>;

function serializeProject(row: typeof projects.$inferSelect) {
  return {
    createdAt: row.createdAt,
    id: row.id,
    name: row.name,
  };
}

export async function loadProjectSessionContext(db: Db) {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.createdAt));
  const currentProject = await resolveCurrentProject(db, rows);

  if (!currentProject) {
    return null;
  }

  return {
    currentProject,
    projects: rows.map(serializeProject),
  };
}
