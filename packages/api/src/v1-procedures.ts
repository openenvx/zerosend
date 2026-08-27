import { ORPCError, os } from '@orpc/server';

import type { ApiKeyPrincipal } from './auth/types';
import {
  apiLogger,
  type EvlogOrpcContext,
  evlogProcedure,
} from './logging/evlog';
import { setApiKeyLogFields } from './logging/procedure-log';
import type { V1Context } from './v1-context';

export const v1o = os
  .$context<V1Context & EvlogOrpcContext>()
  .use(evlogProcedure);

export const apiKeyProcedure = v1o.use(({ context, next }) => {
  if (!context.principal || context.principal.kind !== 'api_key') {
    apiLogger.warn('auth', 'V1 API key authentication failed');
    throw new ORPCError('UNAUTHORIZED', { message: 'Unauthorized' });
  }

  const principal = context.principal as ApiKeyPrincipal;
  setApiKeyLogFields(context.log, principal);

  return next({
    context: {
      ...context,
      principal,
    },
  });
});

export const sendScopeProcedure = apiKeyProcedure.use(({ context, next }) => {
  if (!context.principal.scopes.includes('send')) {
    context.log.warn({
      action: 'v1.send_scope_missing',
      scopes: context.principal.scopes,
    });
    throw new ORPCError('FORBIDDEN', { message: 'Forbidden' });
  }

  return next();
});
