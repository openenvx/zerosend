import type { createDb } from '@zerosend/db';
import { settings } from '@zerosend/db/schema';
import { eq } from 'drizzle-orm';

import { MissingFromAddressError } from './errors';

type Db = ReturnType<typeof createDb>;

const SETTINGS_ID = 'default';

export async function resolveFromAddress(
  db: Db,
  from: string | undefined
): Promise<string> {
  if (from) {
    return from;
  }

  const [row] = await db
    .select({ defaultFrom: settings.defaultFrom })
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);

  if (row?.defaultFrom) {
    return row.defaultFrom;
  }

  throw new MissingFromAddressError();
}
