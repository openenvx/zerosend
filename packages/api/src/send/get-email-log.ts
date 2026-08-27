import type { createDb } from '@zerosend/db';
import { emailLogs } from '@zerosend/db/schema';
import { and, eq } from 'drizzle-orm';

type Db = ReturnType<typeof createDb>;

export interface GetEmailLogOptions {
  id: string;
  projectId: string;
}

export async function getEmailLog(db: Db, options: GetEmailLogOptions) {
  const [row] = await db
    .select()
    .from(emailLogs)
    .where(
      and(
        eq(emailLogs.id, options.id),
        eq(emailLogs.projectId, options.projectId)
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    apiKeyId: row.apiKeyId,
    apiKeyPrefix: row.apiKeyPrefix,
    cloudflareMessageId: row.cloudflareMessageId,
    createdAt: row.createdAt,
    error: row.error,
    fromAddress: row.fromAddress,
    htmlBody: row.htmlBody,
    id: row.id,
    isTest: row.isTest === 1,
    status: row.status,
    subject: row.subject,
    templateId: row.templateId,
    textBody: row.textBody,
    toAddress: row.toAddress,
  };
}
