export const SEND_RATE_LIMIT = 100;
export const SEND_RATE_WINDOW_SECONDS = 60;

export interface RateLimitState {
  limited: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function getRateLimitWindowStart(nowMs: number): number {
  const nowSeconds = Math.floor(nowMs / 1000);
  return (
    Math.floor(nowSeconds / SEND_RATE_WINDOW_SECONDS) * SEND_RATE_WINDOW_SECONDS
  );
}

export function getRateLimitWindowReset(windowStart: number): number {
  return windowStart + SEND_RATE_WINDOW_SECONDS;
}

export function buildRateLimitState(
  count: number,
  reset: number
): RateLimitState {
  const limited = count > SEND_RATE_LIMIT;
  const remaining = limited ? 0 : Math.max(0, SEND_RATE_LIMIT - count);

  return {
    limited,
    limit: SEND_RATE_LIMIT,
    remaining,
    reset,
  };
}

export function buildRateLimitHeaders(state: RateLimitState): HeadersInit {
  return {
    'X-RateLimit-Limit': String(state.limit),
    'X-RateLimit-Remaining': String(state.remaining),
    'X-RateLimit-Reset': String(state.reset),
  };
}
