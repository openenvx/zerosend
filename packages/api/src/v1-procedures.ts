import { ORPCError, os } from '@orpc/server';

import type { ApiKeyPrincipal } from './auth/types';
import type { V1Context } from './v1-context';

export const v1o = os.$context<V1Context>();

export const apiKeyProcedure = v1o.use(({ context, next }) => {
  if (!context.principal || context.principal.kind !== 'api_key') {
    throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' });
  }

  return next({
    context: {
      ...context,
      principal: context.principal as ApiKeyPrincipal,
    },
  });
});

export const sendScopeProcedure = apiKeyProcedure.use(({ context, next }) => {
  if (!context.principal.scopes.includes('send')) {
    throw new ORPCError('FORBIDDEN', { message: 'Forbidden' });
  }

  return next();
});
