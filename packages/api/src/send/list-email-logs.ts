import type { createDb } from '@zerosend/db';
import { emailLogs } from '@zerosend/db/schema';
import { desc, eq } from 'drizzle-orm';

type Db = ReturnType<typeof createDb>;

export const LOGS_LIST_LIMIT = 50;
export const MAILBOX_LIST_LIMIT = 100;

export interface ListEmailLogsOptions {
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
  toAddress: emailLogs.toAddress,
};

export async function listEmailLogs(
  db: Db,
  options: ListEmailLogsOptions = {}
) {
  const limit = options.limit ?? LOGS_LIST_LIMIT;

  const baseQuery = db.select(listFields).from(emailLogs);
  const filtered = options.testOnly
    ? baseQuery.where(eq(emailLogs.isTest, 1))
    : baseQuery;

  const rows = await filtered.orderBy(desc(emailLogs.createdAt)).limit(limit);

  return rows.map((row) => ({
    ...row,
    isTest: row.isTest === 1,
  }));
}
