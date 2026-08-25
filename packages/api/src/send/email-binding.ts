export interface SendEmailMessage {
  to: string;
  from: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SendEmailResult {
  messageId: string;
}

export interface SendEmailBinding {
  send(message: SendEmailMessage): Promise<SendEmailResult>;
}
