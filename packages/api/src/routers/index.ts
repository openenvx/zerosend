import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../procedures";
import { keysRouter } from "./keys";
import { settingsRouter } from "./settings";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  keys: keysRouter,
  settings: settingsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
