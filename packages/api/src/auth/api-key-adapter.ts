import { createDb } from "@zerosend/db";
import { apiKeys } from "@zerosend/db/schema";
import { and, eq, isNull } from "drizzle-orm";

import { hashApiKey } from "./api-key-crypto";
import type { AuthAdapter, Principal } from "./types";

export class ApiKeyAdapter implements AuthAdapter {
  async authenticate(request: Request): Promise<Principal | null> {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    const rawKey = authorization.slice("Bearer ".length).trim();
    if (!rawKey.startsWith("zs_live_")) {
      return null;
    }

    const db = createDb();
    const keyHash = await hashApiKey(rawKey);
    const [row] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      kind: "api_key",
      id: row.id,
      scopes: JSON.parse(row.scopes) as string[],
    };
  }
}
