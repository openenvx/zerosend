import type { RouterClient } from '@orpc/server';

import { publicProcedure } from '../procedures';
import { domainsRouter } from './domains';
import { keysRouter } from './keys';
import { logsRouter } from './logs';
import { mailboxRouter } from './mailbox';
import { projectsRouter } from './projects';
import { settingsRouter } from './settings';
import { templatesRouter } from './templates';

export const appRouter = {
  domains: domainsRouter,
  healthCheck: publicProcedure.handler(() => 'OK'),
  keys: keysRouter,
  logs: logsRouter,
  mailbox: mailboxRouter,
  projects: projectsRouter,
  settings: settingsRouter,
  templates: templatesRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
