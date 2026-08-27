import { ORPCError } from '@orpc/server';
import { z } from 'zod';

import { adminProcedure } from '../procedures';
import { getEmailLog } from '../send/get-email-log';
import { listEmailLogs } from '../send/list-email-logs';

export const logsRouter = {
  get: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const log = await getEmailLog(context.db, input);

      if (!log) {
        throw new ORPCError('NOT_FOUND', { message: 'Log not found' });
      }

      return log;
    }),

  list: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).optional(),
        projectId: z.string().uuid(),
        testOnly: z.boolean().optional(),
      })
    )
    .handler(async ({ context, input }) =>
      listEmailLogs(context.db, {
        limit: input.limit,
        projectId: input.projectId,
        testOnly: input.testOnly,
      })
    ),
};
