import { ORPCError } from '@orpc/server';
import { apiKeys, emailLogs } from '@zerosend/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

import { parseKeyType } from '../auth/types';
import { adminProcedure } from '../procedures';
import { MAILBOX_LIST_LIMIT, listEmailLogs } from '../send/list-email-logs';
import { sendEmail, sendEmailInputSchema } from '../send/send-email';

export const mailboxRouter = {
  get: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select()
        .from(emailLogs)
        .where(
          and(
            eq(emailLogs.id, input.id),
            eq(emailLogs.projectId, input.projectId),
            eq(emailLogs.isTest, 1)
          )
        )
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Message not found' });
      }

      return {
        apiKeyPrefix: row.apiKeyPrefix,
        createdAt: row.createdAt,
        error: row.error,
        fromAddress: row.fromAddress,
        htmlBody: row.htmlBody,
        id: row.id,
        status: row.status,
        subject: row.subject,
        textBody: row.textBody,
        toAddress: row.toAddress,
      };
    }),

  list: adminProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .handler(async ({ context, input }) =>
      listEmailLogs(context.db, {
        limit: MAILBOX_LIST_LIMIT,
        projectId: input.projectId,
        testOnly: true,
      })
    ),

  send: adminProcedure
    .input(
      sendEmailInputSchema.extend({
        keyId: z.string().uuid(),
        projectId: z.string().uuid(),
      })
    )
    .handler(async ({ context, input }) => {
      const { keyId, projectId, ...emailInput } = input;

      context.log.set({
        mailbox: {
          action: 'send_test',
          keyId,
          projectId,
        },
      });

      const [key] = await context.db
        .select({
          id: apiKeys.id,
          keyType: apiKeys.keyType,
          prefix: apiKeys.prefix,
          projectId: apiKeys.projectId,
        })
        .from(apiKeys)
        .where(
          and(
            eq(apiKeys.id, keyId),
            eq(apiKeys.projectId, projectId),
            eq(apiKeys.keyType, 'test'),
            isNull(apiKeys.revokedAt)
          )
        )
        .limit(1);

      if (!key) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Active test API key not found',
        });
      }

      const keyType = parseKeyType(key.keyType);
      if (!keyType) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Active test API key not found',
        });
      }

      return sendEmail(context.db, emailInput, {
        keyId: key.id,
        keyPrefix: key.prefix,
        keyType,
        projectId: key.projectId,
      });
    }),
};
