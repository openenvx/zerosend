import { os } from '@orpc/server';

import type { Context } from './context';
import { type EvlogOrpcContext, evlogProcedure } from './logging/evlog';

export const o = os.$context<Context & EvlogOrpcContext>().use(evlogProcedure);
