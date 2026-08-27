import type { createDb } from '@zerosend/db';
import { emailLogs } from '@zerosend/db/schema';
import { and, desc, eq } from 'drizzle-orm';

type Db = ReturnType<typeof createDb>;

export const LOGS_LIST_LIMIT = 50;
export const MAILBOX_LIST_LIMIT = 100;

export interface ListEmailLogsOptions {
  projectId: string;
  testOnly?: boolean;
  limit?: number;
}

const listFields = {
  apiKeyPrefix: emailLogs.apiKeyPrefix,
  cloudflareMessageId: emailLogs.cloudflareMessageId,
  createdAt: emailLogs.createdAt,
  error: emailLogs.error,
  fromAddress: emailLogs.fromAddress,
  id: emailLogs.id,
  isTest: emailLogs.isTest,
  status: emailLogs.status,
  subject: emailLogs.subject,
  templateId: emailLogs.templateId,
  toAddress: emailLogs.toAddress,
};

export async function listEmailLogs(db: Db, options: ListEmailLogsOptions) {
  const limit = options.limit ?? LOGS_LIST_LIMIT;

  const conditions = [eq(emailLogs.projectId, options.projectId)];
  if (options.testOnly) {
    conditions.push(eq(emailLogs.isTest, 1));
  }

  const rows = await db
    .select(listFields)
    .from(emailLogs)
    .where(and(...conditions))
    .orderBy(desc(emailLogs.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    isTest: row.isTest === 1,
  }));
}
