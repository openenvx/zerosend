import { describe, expect, it, vi } from 'vitest';

import {
  consumeApiKeyRateLimit,
  createMemoryKvNamespace,
  peekApiKeyRateLimit,
} from './kv-rate-limiter';
import {
  buildRateLimitHeaders,
  getRateLimitWindowReset,
  getRateLimitWindowStart,
  SEND_RATE_LIMIT,
  SEND_RATE_WINDOW_SECONDS,
} from './rate-limit';

describe('rate limit windows', () => {
  it('floors timestamps to 60 second windows', () => {
    const nowMs = 1_700_000_061_000;
    const windowStart = getRateLimitWindowStart(nowMs);

    expect(windowStart % SEND_RATE_WINDOW_SECONDS).toBe(0);
    expect(getRateLimitWindowReset(windowStart)).toBe(
      windowStart + SEND_RATE_WINDOW_SECONDS
    );
  });
});

describe('kv rate limiter', () => {
  const nowMs = Date.now();

  it('allows up to the configured limit', async () => {
    const kv = createMemoryKvNamespace();
    const apiKeyId = 'key-1';

    for (let index = 0; index < SEND_RATE_LIMIT; index += 1) {
      const state = await consumeApiKeyRateLimit(kv, apiKeyId, nowMs);
      expect(state.limited).toBe(false);
    }

    const limited = await consumeApiKeyRateLimit(kv, apiKeyId, nowMs);
    expect(limited.limited).toBe(true);
    expect(limited.remaining).toBe(0);
  });

  it('increments within a window that is about to reset', async () => {
    const kv = createMemoryKvNamespace();
    const apiKeyId = 'key-end-window';
    const windowStart = getRateLimitWindowStart(nowMs);
    const nearEndMs =
      windowStart * 1000 + (SEND_RATE_WINDOW_SECONDS - 21) * 1000;

    await consumeApiKeyRateLimit(kv, apiKeyId, nearEndMs);

    const peeked = await peekApiKeyRateLimit(kv, apiKeyId, nearEndMs);
    expect(peeked.remaining).toBe(SEND_RATE_LIMIT - 1);
  });

  it('uses a KV TTL of at least 60s even at the end of a window', async () => {
    const kv = createMemoryKvNamespace();
    const put = vi.spyOn(kv, 'put');
    const windowStart = getRateLimitWindowStart(nowMs);
    const lastMs = windowStart * 1000 + SEND_RATE_WINDOW_SECONDS * 1000 - 1;

    await consumeApiKeyRateLimit(kv, 'key-ttl', lastMs);

    expect(put).toHaveBeenCalledOnce();
    const options = put.mock.calls[0]?.[2] as KVNamespacePutOptions | undefined;
    expect(options?.expiration).toBeUndefined();
    expect(options?.expirationTtl).toBeGreaterThanOrEqual(60);
  });

  it('peeks without incrementing', async () => {
    const kv = createMemoryKvNamespace();
    const apiKeyId = 'key-1';

    await consumeApiKeyRateLimit(kv, apiKeyId, nowMs);
    await consumeApiKeyRateLimit(kv, apiKeyId, nowMs);

    const peeked = await peekApiKeyRateLimit(kv, apiKeyId, nowMs);
    expect(peeked.remaining).toBe(SEND_RATE_LIMIT - 2);

    const consumed = await consumeApiKeyRateLimit(kv, apiKeyId, nowMs);
    expect(consumed.remaining).toBe(SEND_RATE_LIMIT - 3);
  });

  it('builds rate limit headers', () => {
    const headers = buildRateLimitHeaders({
      limited: false,
      limit: 100,
      remaining: 42,
      reset: 1_700_000_060,
    });

    expect(headers).toEqual({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '42',
      'X-RateLimit-Reset': '1700000060',
    });
  });
});
