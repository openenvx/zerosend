import type { createDb } from '@zerosend/db';

import { assertLiveSendDomainAllowed } from './assert-live-send-domain';
import { buildSendEmailMessage } from './build-send-message';
import type { SendEmailBinding } from './email-binding';
import {
  formatCloudflareEmailError,
  mapCloudflareEmailError,
} from './map-cloudflare-email-error';
import { resolveFromAddress } from './resolve-from-address';
import type { SendEmailInput } from './send-email-input';
import { storeLiveEmailLog } from './store-live-email';
import type { SendEmailKeyContext } from './store-test-email';

type Db = ReturnType<typeof createDb>;

export async function sendLiveEmail(
  db: Db,
  input: SendEmailInput,
  keyContext: SendEmailKeyContext,
  emailBinding: SendEmailBinding
): Promise<{ id: string }> {
  const fromAddress = await resolveFromAddress(db, input.from);

  await assertLiveSendDomainAllowed(db, fromAddress);

  try {
    const response = await emailBinding.send(
      buildSendEmailMessage(input, fromAddress)
    );

    return storeLiveEmailLog(db, {
      cloudflareMessageId: response.messageId,
      fromAddress,
      input,
      keyContext,
      status: 'sent',
    });
  } catch (error) {
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
