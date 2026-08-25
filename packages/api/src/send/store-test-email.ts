import type { createDb } from '@zerosend/db';
import { emailLogs } from '@zerosend/db/schema';

import type { ApiKeyType } from '../auth/types';
import type { SendEmailInput } from './send-email-input';
import { formatToAddressForLog } from './send-email-input';

export interface SendEmailKeyContext {
  keyId: string;
  keyPrefix: string;
  keyType: ApiKeyType;
}

type Db = ReturnType<typeof createDb>;

export async function storeTestEmail(
  db: Db,
  input: SendEmailInput & { from: string },
  keyContext: SendEmailKeyContext
): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(emailLogs).values({
    apiKeyId: keyContext.keyId,
    apiKeyPrefix: keyContext.keyPrefix,
    createdAt: now,
    error: null,
    fromAddress: input.from,
    htmlBody: input.html ?? null,
    id,
    isTest: 1,
    status: 'sent',
    subject: input.subject,
    textBody: input.text ?? null,
    toAddress: formatToAddressForLog(input.to),
  });

  return { id };
}
