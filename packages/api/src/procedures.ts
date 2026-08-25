import { ORPCError } from '@orpc/server';

import { requireAdmin } from './context';
import { o } from './index';

export const publicProcedure = o;

export const adminProcedure = o.use(({ context, next }) => {
  try {
    const principal = requireAdmin(context.principal);
    return next({ context: { ...context, principal } });
  } catch {
    throw new ORPCError('UNAUTHORIZED');
  }
});
