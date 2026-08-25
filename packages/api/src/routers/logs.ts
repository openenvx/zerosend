import { z } from 'zod';

import { adminProcedure } from '../procedures';
import { listEmailLogs } from '../send/list-email-logs';

export const logsRouter = {
  list: adminProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).optional(),
          testOnly: z.boolean().optional(),
        })
        .optional()
    )
    .handler(async ({ context, input }) =>
      listEmailLogs(context.db, {
        limit: input?.limit,
        testOnly: input?.testOnly,
      })
    ),
};
