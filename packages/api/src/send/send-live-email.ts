import type { createDb } from '@zerosend/db';

import { apiLogger } from '../logging/evlog';
import { assertLiveSendDomainAllowed } from './assert-live-send-domain';
import { buildSendEmailMessage } from './build-send-message';
import type { SendEmailBinding } from './email-binding';
import {
  formatCloudflareEmailError,
  mapCloudflareEmailError,
} from './map-cloudflare-email-error';
import { resolveFromAddress } from './resolve-from-address';
import type { ResolvedSendEmailInput } from './send-email-input';
import { storeLiveEmailLog } from './store-live-email';
import type { SendEmailKeyContext } from './store-test-email';

type Db = ReturnType<typeof createDb>;

export async function sendLiveEmail(
  db: Db,
  input: ResolvedSendEmailInput,
  keyContext: SendEmailKeyContext,
  emailBinding: SendEmailBinding
): Promise<{ id: string }> {
  const fromAddress = await resolveFromAddress(db, input.from);

  await assertLiveSendDomainAllowed(db, fromAddress);

  apiLogger.info({
    action: 'send_live_email',
    fromAddress,
    keyId: keyContext.keyId,
    projectId: keyContext.projectId,
    subject: input.subject,
  });

  try {
    const response = await emailBinding.send(
      buildSendEmailMessage(input, fromAddress)
    );

    return storeLiveEmailLog(db, {
      // Local Miniflare simulation logs the email but may not return a messageId.
      cloudflareMessageId: response?.messageId ?? null,
      fromAddress,
      input,
      keyContext,
      status: 'sent',
    });
  } catch (error) {
    apiLogger.error({
      action: 'send_live_email_failed',
      error: formatCloudflareEmailError(error),
      fromAddress,
      keyId: keyContext.keyId,
      projectId: keyContext.projectId,
    });

    const result = await storeLiveEmailLog(db, {
      error: formatCloudflareEmailError(error),
      fromAddress,
      input,
      keyContext,
      status: 'failed',
    });

    throw mapCloudflareEmailError(error, result.id);
  }
}
