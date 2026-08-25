import { apiKeys } from '@zerosend/db/schema';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  generateApiKey,
  getApiKeyPrefix,
  hashApiKey,
} from '../auth/api-key-crypto';
import { parseKeyType } from '../auth/types';
import { adminProcedure } from '../procedures';

export const keysRouter = {
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        type: z.enum(['test', 'live']).default('test'),
      })
    )
    .handler(async ({ context, input }) => {
      const rawKey = generateApiKey(input.type);
      const keyHash = await hashApiKey(rawKey);
      const id = crypto.randomUUID();
      const now = new Date();

      await context.db.insert(apiKeys).values({
        createdAt: now,
        id,
        keyHash,
        keyType: input.type,
        name: input.name,
        prefix: getApiKeyPrefix(rawKey),
        scopes: JSON.stringify(['send']),
      });

      return {
        createdAt: now,
        id,
        key: rawKey,
        keyType: input.type,
        name: input.name,
        prefix: getApiKeyPrefix(rawKey),
        scopes: ['send'],
      };
    }),

  list: adminProcedure.handler(async ({ context }) => {
    const rows = await context.db
      .select({
        createdAt: apiKeys.createdAt,
        id: apiKeys.id,
        keyType: apiKeys.keyType,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        revokedAt: apiKeys.revokedAt,
        scopes: apiKeys.scopes,
      })
      .from(apiKeys)
      .orderBy(desc(apiKeys.createdAt));

    return rows.map((row) => {
      const keyType = parseKeyType(row.keyType) ?? 'live';

      return {
        ...row,
        active: row.revokedAt === null,
        keyType,
        scopes: JSON.parse(row.scopes) as string[],
      };
    });
  }),

  revoke: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const now = new Date();
      await context.db
        .update(apiKeys)
        .set({ revokedAt: now })
        .where(eq(apiKeys.id, input.id));

      return { ok: true as const };
    }),
};
