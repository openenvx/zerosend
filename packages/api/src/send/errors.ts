export class MissingFromAddressError extends Error {
  constructor() {
    super('from is required');
    this.name = 'MissingFromAddressError';
  }
}

export class SendEmailDeliveryError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly logId: string | null;

  constructor(
    message: string,
    code: string,
    httpStatus: number,
    logId: string | null = null
  ) {
    super(message);
    this.name = 'SendEmailDeliveryError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.logId = logId;
  }
}
