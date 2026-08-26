import type { createDb } from '@zerosend/db';

import type { SendEmailBinding } from './email-binding';
import { MissingFromAddressError } from './errors';
import type { SendEmailInput } from './send-email-input';
import { sendLiveEmail } from './send-live-email';
import { storeTestEmail } from './store-test-email';
import type { SendEmailKeyContext } from './store-test-email';

type Db = ReturnType<typeof createDb>;

export {
  MissingFromAddressError,
  SendEmailDeliveryError,
  UnverifiedFromDomainError,
} from './errors';
export {
  formatToAddressForLog,
  normalizeRecipients,
  sendEmailInputSchema,
  type SendEmailInput,
} from './send-email-input';
export type { SendEmailBinding } from './email-binding';
export type { SendEmailKeyContext } from './store-test-email';

export interface SendEmailOptions {
  emailBinding?: SendEmailBinding;
}

export async function sendEmail(
  db: Db,
  input: SendEmailInput,
  keyContext: SendEmailKeyContext,
  options: SendEmailOptions = {}
): Promise<{ id: string }> {
  if (keyContext.keyType === 'live') {
    if (!options.emailBinding) {
      throw new Error('EMAIL binding is not configured');
    }

    return sendLiveEmail(db, input, keyContext, options.emailBinding);
  }

  if (!input.from) {
    throw new MissingFromAddressError();
  }

  return storeTestEmail(db, { ...input, from: input.from }, keyContext);
}
