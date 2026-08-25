import type { SendEmailMessage } from './email-binding';
import type { SendEmailInput } from './send-email-input';

export function buildSendEmailMessage(
  input: SendEmailInput,
  fromAddress: string
): SendEmailMessage {
  const message: SendEmailMessage = {
    from: input.fromName
      ? { email: fromAddress, name: input.fromName }
      : fromAddress,
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: input.to,
  };

  if (input.replyTo) {
    message.replyTo = input.replyTo;
  }

  return message;
}
