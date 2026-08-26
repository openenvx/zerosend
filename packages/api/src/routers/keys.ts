import { apiKeys } from '@zerosend/db/schema';
import { and, desc, eq } from 'drizzle-orm';
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
        projectId: z.string().uuid(),
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
        projectId: input.projectId,
        scopes: JSON.stringify(['send']),
      });

      return {
        createdAt: now,
        id,
        key: rawKey,
        keyType: input.type,
        name: input.name,
        prefix: getApiKeyPrefix(rawKey),
        projectId: input.projectId,
        scopes: ['send'],
      };
    }),

  list: adminProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const rows = await context.db
        .select({
          createdAt: apiKeys.createdAt,
          id: apiKeys.id,
          keyType: apiKeys.keyType,
          name: apiKeys.name,
          prefix: apiKeys.prefix,
          projectId: apiKeys.projectId,
          revokedAt: apiKeys.revokedAt,
          scopes: apiKeys.scopes,
        })
        .from(apiKeys)
        .where(eq(apiKeys.projectId, input.projectId))
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
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const now = new Date();
      await context.db
        .update(apiKeys)
        .set({ revokedAt: now })
        .where(
          and(eq(apiKeys.id, input.id), eq(apiKeys.projectId, input.projectId))
        );

      return { ok: true as const };
    }),
};
