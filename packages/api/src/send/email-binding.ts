export interface SendEmailAddress {
  email: string;
  name?: string;
}

export interface SendEmailMessage {
  to: string | string[];
  from: string | SendEmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  messageId: string;
}

export interface SendEmailBinding {
  send(message: SendEmailMessage): Promise<SendEmailResult | undefined>;
}
