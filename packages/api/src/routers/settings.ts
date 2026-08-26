import { ORPCError } from '@orpc/server';
import { settings } from '@zerosend/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { isVerifiedDefaultFromHost } from '../domains/find-domain';
import { adminProcedure } from '../procedures';
import { InvalidDefaultFromDomainError } from '../send/errors';
import { ensureSettingsRow, SETTINGS_ID } from '../settings/instance-settings';

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
