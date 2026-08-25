import type { RouterClient } from '@orpc/server';

import { publicProcedure } from '../procedures';
import { keysRouter } from './keys';
import { logsRouter } from './logs';
import { mailboxRouter } from './mailbox';
import { settingsRouter } from './settings';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => 'OK'),
  keys: keysRouter,
  logs: logsRouter,
  mailbox: mailboxRouter,
  settings: settingsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
