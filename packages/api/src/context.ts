import { createDb } from '@zerosend/db';

import { AdminTokenAdapter } from './auth/admin-token-adapter';
import type { AdminPrincipal, Principal } from './auth/types';

export async function createContext(options: { req: Request }) {
  const adminAdapter = new AdminTokenAdapter();
  const principal = await adminAdapter.authenticate(options.req);
  const db = createDb();

  return {
    db,
    principal,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export function requireAdmin(principal: Principal | null): AdminPrincipal {
  if (!principal || principal.kind !== 'admin') {
    throw new Error('Unauthorized');
  }

  return principal;
}
