import type { createDb } from '@zerosend/db';
import { settings } from '@zerosend/db/schema';
import { eq } from 'drizzle-orm';

export const SETTINGS_ID = 'default';

type Db = ReturnType<typeof createDb>;

export async function ensureSettingsRow(db: Db) {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);

  if (row) {
    return row;
  }

  await db.insert(settings).values({
    currentProjectId: null,
    defaultFrom: null,
    id: SETTINGS_ID,
  });

  const [created] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);

  return (
    created ?? { currentProjectId: null, defaultFrom: null, id: SETTINGS_ID }
  );
}

export async function getStoredCurrentProjectId(db: Db) {
  const row = await ensureSettingsRow(db);
  return row.currentProjectId;
}

export async function setStoredCurrentProjectId(db: Db, projectId: string) {
  await ensureSettingsRow(db);
  await db
    .update(settings)
    .set({ currentProjectId: projectId })
    .where(eq(settings.id, SETTINGS_ID));
}
