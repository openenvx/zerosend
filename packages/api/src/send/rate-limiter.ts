import { consumeApiKeyRateLimit, peekApiKeyRateLimit } from './kv-rate-limiter';
import { buildRateLimitHeaders, type RateLimitState } from './rate-limit';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/** Matches [@orpc/ratelimit](https://orpc.dev/docs/helpers/ratelimit) `RateLimiter`. */
export interface RateLimiter {
  limit(key: string, options?: { weight?: number }): Promise<RateLimitResult>;
}

function toRateLimitResult(state: RateLimitState): RateLimitResult {
  return {
    success: !state.limited,
    limit: state.limit,
    remaining: state.remaining,
    reset: state.reset,
  };
}

export function createPeekApiKeyRateLimiter(
  kv: KVNamespace,
  nowMs: number
): RateLimiter {
  return {
    async limit(apiKeyId: string): Promise<RateLimitResult> {
      const state = await peekApiKeyRateLimit(kv, apiKeyId, nowMs);
      return toRateLimitResult(state);
    },
  };
}

export function createConsumeApiKeyRateLimiter(
  kv: KVNamespace,
  nowMs: number
): RateLimiter {
  return {
    async limit(apiKeyId: string): Promise<RateLimitResult> {
      const state = await consumeApiKeyRateLimit(kv, apiKeyId, nowMs);
      return toRateLimitResult(state);
    },
  };
}

export function rateLimitResultToHeaders(result: RateLimitResult): HeadersInit {
  return buildRateLimitHeaders({
    limited: !result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  });
}
