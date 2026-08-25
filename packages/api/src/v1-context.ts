import { createDb } from '@zerosend/db';
import { env } from '@zerosend/env/server';

import { ApiKeyAdapter } from './auth/api-key-adapter';
import type { ApiKeyPrincipal, Principal } from './auth/types';
import type { SendEmailBinding } from './send/email-binding';

type Db = ReturnType<typeof createDb>;

export interface V1Context {
  db: Db;
  emailBinding: SendEmailBinding | undefined;
  nowMs: number;
  principal: Principal | null;
  rateLimitKv: KVNamespace;
}

export interface CreateV1ContextOptions {
  req: Request;
  db?: Db;
  emailBinding?: SendEmailBinding;
  now?: () => number;
  principal?: Principal | null;
  rateLimitKv?: KVNamespace;
}

export async function createV1Context(
  options: CreateV1ContextOptions
): Promise<V1Context> {
  const db = options.db ?? createDb();
  const nowMs = options.now?.() ?? Date.now();
  const emailBinding = options.emailBinding ?? env.EMAIL;
  const rateLimitKv = options.rateLimitKv ?? env.RATE_LIMIT_KV;

  let principal = options.principal;
  if (principal === undefined) {
    const adapter = new ApiKeyAdapter();
    principal = await adapter.authenticate(options.req);
  }

  return {
    db,
    emailBinding: emailBinding as SendEmailBinding | undefined,
    nowMs,
    principal,
    rateLimitKv,
  };
}

export type { ApiKeyPrincipal };
