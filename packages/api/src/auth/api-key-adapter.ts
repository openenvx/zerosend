import { createDb } from '@zerosend/db';
import { apiKeys } from '@zerosend/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

import { hashApiKey, parseApiKeyType } from './api-key-crypto';
import type { ApiKeyPrincipal, AuthAdapter, Principal } from './types';
import { parseKeyType } from './types';

export class ApiKeyAdapter implements AuthAdapter {
  async authenticate(request: Request): Promise<Principal | null> {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const rawKey = authorization.slice('Bearer '.length).trim();
    const prefixKeyType = parseApiKeyType(rawKey);
    if (!prefixKeyType) {
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

    const dbKeyType = parseKeyType(row.keyType);
    if (!dbKeyType || prefixKeyType !== dbKeyType) {
      return null;
    }

    const principal: ApiKeyPrincipal = {
      id: row.id,
      keyPrefix: row.prefix,
      keyType: dbKeyType,
      kind: 'api_key',
      projectId: row.projectId,
      scopes: JSON.parse(row.scopes) as string[],
    };

    return principal;
  }
}
