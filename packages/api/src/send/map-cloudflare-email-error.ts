import { SendEmailDeliveryError } from './errors';

const BAD_REQUEST_CODES = new Set([
  'E_SENDER_NOT_VERIFIED',
  'E_VALIDATION_ERROR',
  'E_FIELD_MISSING',
  'E_SENDER_DOMAIN_NOT_AVAILABLE',
  'E_TOO_MANY_RECIPIENTS',
  'E_RECIPIENT_NOT_ALLOWED',
  'E_RECIPIENT_SUPPRESSED',
  'E_CONTENT_TOO_LARGE',
  'E_HEADER_NOT_ALLOWED',
  'E_HEADER_USE_API_FIELD',
  'E_HEADER_VALUE_INVALID',
  'E_HEADER_VALUE_TOO_LONG',
  'E_HEADER_NAME_INVALID',
  'E_HEADERS_TOO_LARGE',
  'E_HEADERS_TOO_MANY',
]);

const RATE_LIMIT_CODES = new Set([
  'E_RATE_LIMIT_EXCEEDED',
  'E_DAILY_LIMIT_EXCEEDED',
]);

function getHttpStatusForCode(code: string): number {
  if (BAD_REQUEST_CODES.has(code)) {
    return 400;
  }

  if (RATE_LIMIT_CODES.has(code)) {
    return 429;
  }

  return 502;
}

function isCloudflareEmailError(
  error: unknown
): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export function mapCloudflareEmailError(
  error: unknown,
  logId: string | null = null
): SendEmailDeliveryError {
  if (isCloudflareEmailError(error)) {
    return new SendEmailDeliveryError(
      error.message,
      error.code,
      getHttpStatusForCode(error.code),
      logId
    );
  }

  const message =
    error instanceof Error ? error.message : 'Email delivery failed';

  return new SendEmailDeliveryError(message, 'UNKNOWN', 502, logId);
}

export function formatCloudflareEmailError(error: unknown): string {
  if (isCloudflareEmailError(error)) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Email delivery failed';
}
