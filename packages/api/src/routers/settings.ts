import { ORPCError } from '@orpc/server';
import { settings } from '@zerosend/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import type { Context } from '../context';
import { isVerifiedDefaultFromHost } from '../domains/find-domain';
import { adminProcedure } from '../procedures';
import { InvalidDefaultFromDomainError } from '../send/errors';

const SETTINGS_ID = 'default';

async function ensureSettingsRow(db: Context['db']) {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);

  if (row) {
    return row;
  }

  await db.insert(settings).values({ defaultFrom: null, id: SETTINGS_ID });
  const [created] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);

  return created ?? { defaultFrom: null, id: SETTINGS_ID };
}

export const settingsRouter = {
  get: adminProcedure.handler(async ({ context }) => {
    const row = await ensureSettingsRow(context.db);
    const defaultFrom = row?.defaultFrom ?? null;
    let defaultFromValid = true;

    if (defaultFrom) {
      defaultFromValid = await isVerifiedDefaultFromHost(
        context.db,
        defaultFrom
      );
    }

    return {
      defaultFrom,
      defaultFromValid,
    };
  }),

  update: adminProcedure
    .input(
      z.object({
        defaultFrom: z
          .union([z.string().email(), z.literal('')])
          .transform((value) => (value === '' ? null : value)),
      })
    )
    .handler(async ({ context, input }) => {
      if (input.defaultFrom) {
        const verified = await isVerifiedDefaultFromHost(
          context.db,
          input.defaultFrom
        );
        if (!verified) {
          throw new ORPCError('BAD_REQUEST', {
            message: new InvalidDefaultFromDomainError().message,
          });
        }
      }

      await ensureSettingsRow(context.db);
      await context.db
        .update(settings)
        .set({ defaultFrom: input.defaultFrom })
        .where(eq(settings.id, SETTINGS_ID));

      return {
        defaultFrom: input.defaultFrom,
      };
    }),
};
