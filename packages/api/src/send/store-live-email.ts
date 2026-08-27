import type { createDb } from '@zerosend/db';
import { emailLogs } from '@zerosend/db/schema';

import type { ResolvedSendEmailInput } from './send-email-input';
import { formatToAddressForLog } from './send-email-input';
import type { SendEmailKeyContext } from './store-test-email';

type Db = ReturnType<typeof createDb>;

interface StoreLiveEmailLogInput {
  input: ResolvedSendEmailInput;
  keyContext: SendEmailKeyContext;
  fromAddress: string;
  status: 'sent' | 'failed';
  cloudflareMessageId?: string | null;
  error?: string | null;
}

export async function storeLiveEmailLog(
  db: Db,
  params: StoreLiveEmailLogInput
): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(emailLogs).values({
    apiKeyId: params.keyContext.keyId,
    apiKeyPrefix: params.keyContext.keyPrefix,
    cloudflareMessageId: params.cloudflareMessageId ?? null,
    createdAt: now,
    error: params.error ?? null,
    fromAddress: params.fromAddress,
    htmlBody: null,
    id,
    isTest: 0,
    projectId: params.keyContext.projectId,
    status: params.status,
    subject: params.input.subject,
    templateId: params.input.templateId ?? null,
    textBody: null,
    toAddress: formatToAddressForLog(params.input.to),
  });

  return { id };
}
