export const SEND_EMAIL_TIMEOUT_MS = 30_000;

export class SendEmailTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Email send timed out after ${timeoutMs}ms`);
    this.name = 'SendEmailTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => Error = () => new SendEmailTimeoutError(timeoutMs)
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(onTimeout()), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
