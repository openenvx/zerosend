import type { createDb } from '@zerosend/db';

import { apiLogger } from '../logging/evlog';
import { resolveTemplateForSend } from '../templates/resolve-template-for-send';
import type { SendEmailBinding } from './email-binding';
import { MissingFromAddressError } from './errors';
import type {
  ResolvedSendEmailInput,
  SendEmailInput,
} from './send-email-input';
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
  TemplateNotFoundError,
  TemplateNotPublishedError,
} from '../templates/errors';
export {
  formatToAddressForLog,
  normalizeRecipients,
  sendEmailInputSchema,
  sendEmailTemplateSchema,
  type ResolvedSendEmailInput,
  type SendEmailInput,
  type SendEmailTemplateInput,
} from './send-email-input';
export type { SendEmailBinding } from './email-binding';
export type { SendEmailKeyContext } from './store-test-email';

export interface SendEmailOptions {
  emailBinding?: SendEmailBinding;
}

async function resolveSendEmailInput(
  db: Db,
  input: SendEmailInput,
  projectId: string
): Promise<ResolvedSendEmailInput> {
  if (!input.template) {
    return input;
  }

  const resolved = await resolveTemplateForSend(db, {
    projectId,
    subject: input.subject,
    templateId: input.template.id,
    variables: input.template.variables ?? {},
  });

  const { template: _template, ...rest } = input;

  return {
    ...rest,
    html: resolved.html,
    subject: resolved.subject ?? rest.subject,
    templateId: resolved.templateId,
    text: resolved.text,
  };
}

export async function sendEmail(
  db: Db,
  input: SendEmailInput,
  keyContext: SendEmailKeyContext,
  options: SendEmailOptions = {}
): Promise<{ id: string }> {
  const resolvedInput = await resolveSendEmailInput(
    db,
    input,
    keyContext.projectId
  );

  apiLogger.info({
    action: 'send_email',
    keyType: keyContext.keyType,
    projectId: keyContext.projectId,
    templateId: resolvedInput.templateId ?? null,
    toCount: Array.isArray(resolvedInput.to) ? resolvedInput.to.length : 1,
  });

  if (keyContext.keyType === 'live') {
    if (!options.emailBinding) {
      throw new Error('EMAIL binding is not configured');
    }

    return sendLiveEmail(db, resolvedInput, keyContext, options.emailBinding);
  }

  if (!resolvedInput.from) {
    throw new MissingFromAddressError();
  }

  return storeTestEmail(
    db,
    { ...resolvedInput, from: resolvedInput.from },
    keyContext
  );
}
