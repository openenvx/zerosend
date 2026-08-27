import { onError } from '@orpc/server';
import { createLogger } from 'evlog';
import {
  evlog as evlogProcedureMiddleware,
  type EvlogOrpcContext,
  type EvlogOrpcOptions,
  withEvlog,
  type OrpcFetchHandlerLike,
} from 'evlog/orpc';
import { initWorkersLogger } from 'evlog/workers';

initWorkersLogger({
  env: { service: 'zerosend-api' },
});

export type { EvlogOrpcContext };

export const evlogProcedure = evlogProcedureMiddleware();

export const apiLogger = createLogger({
  env: { service: 'zerosend-api' },
});

export function wrapOrpcHandler<THandler extends OrpcFetchHandlerLike>(
  handler: THandler,
  options?: EvlogOrpcOptions
): THandler {
  return withEvlog(handler, options);
}

export const evlogErrorInterceptor = onError((error: unknown) => {
  if (error instanceof Error) {
    apiLogger.error(error);
    return;
  }

  apiLogger.error({
    action: 'orpc_error',
    error: String(error),
  });
});
