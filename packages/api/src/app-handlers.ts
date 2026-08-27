import { RPCHandler } from '@orpc/server/fetch';

import { evlogErrorInterceptor, wrapOrpcHandler } from './logging/evlog';
import { appRouter } from './routers/index';

export function createAppRpcHandler() {
  return wrapOrpcHandler(
    new RPCHandler(appRouter, {
      interceptors: [evlogErrorInterceptor],
    }),
    { include: ['/api/rpc/**'] }
  );
}

export const appRpcHandler = createAppRpcHandler();
