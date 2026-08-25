import { apiKeys } from "@zerosend/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
  generateApiKey,
  getApiKeyPrefix,
  hashApiKey,
} from "../auth/api-key-crypto";
import { adminProcedure } from "../procedures";

export const keysRouter = {
  list: adminProcedure.handler(async ({ context }) => {
    const rows = await context.db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        scopes: apiKeys.scopes,
        createdAt: apiKeys.createdAt,
        revokedAt: apiKeys.revokedAt,
      })
      .from(apiKeys)
      .orderBy(desc(apiKeys.createdAt));

    return rows.map((row) => ({
      ...row,
      scopes: JSON.parse(row.scopes) as string[],
      active: row.revokedAt === null,
    }));
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
      })
    )
    .handler(async ({ context, input }) => {
      const rawKey = generateApiKey();
      const keyHash = await hashApiKey(rawKey);
      const id = crypto.randomUUID();
      const now = new Date();

      await context.db.insert(apiKeys).values({
        id,
        name: input.name,
        keyHash,
        prefix: getApiKeyPrefix(rawKey),
        scopes: JSON.stringify(["send"]),
        createdAt: now,
      });

      return {
        id,
        name: input.name,
        prefix: getApiKeyPrefix(rawKey),
        key: rawKey,
        scopes: ["send"],
        createdAt: now,
      };
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
