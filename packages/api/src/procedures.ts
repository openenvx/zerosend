import { ORPCError } from '@orpc/server';

import { requireAdmin } from './context';
import { o } from './index';
import { apiLogger } from './logging/evlog';
import { setPrincipalLogFields } from './logging/procedure-log';

export const publicProcedure = o;

export const adminProcedure = o.use(({ context, next }) => {
  try {
    const principal = requireAdmin(context.principal);
    setPrincipalLogFields(context.log, principal);
    return next({ context: { ...context, principal } });
  } catch {
    apiLogger.warn('auth', 'Admin authorization failed');
    throw new ORPCError('UNAUTHORIZED');
  }
});
