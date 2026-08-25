import {
  buildRateLimitState,
  getRateLimitWindowReset,
  getRateLimitWindowStart,
} from './rate-limit';

function getRateLimitKvKey(apiKeyId: string, windowStart: number): string {
  return `rl:${apiKeyId}:${windowStart}`;
}

function getWindowExpirationTtl(nowMs: number, reset: number): number {
  const nowSeconds = Math.floor(nowMs / 1000);
  return Math.max(1, reset - nowSeconds);
}

function parseCount(value: string | null): number {
  if (!value) {
    return 0;
  }

  const count = Number.parseInt(value, 10);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

export async function peekApiKeyRateLimit(
  kv: KVNamespace,
  apiKeyId: string,
  nowMs: number
) {
  const windowStart = getRateLimitWindowStart(nowMs);
  const reset = getRateLimitWindowReset(windowStart);
  const count = parseCount(
    await kv.get(getRateLimitKvKey(apiKeyId, windowStart))
  );

  return buildRateLimitState(count, reset);
}

// Best-effort counter: KV read-modify-write is not atomic across concurrent
// Workers. Bursts can exceed SEND_RATE_LIMIT until a stronger primitive (DO/D1)
// is adopted.
export async function consumeApiKeyRateLimit(
  kv: KVNamespace,
  apiKeyId: string,
  nowMs: number
) {
  const windowStart = getRateLimitWindowStart(nowMs);
  const reset = getRateLimitWindowReset(windowStart);
  const key = getRateLimitKvKey(apiKeyId, windowStart);
  const count = parseCount(await kv.get(key)) + 1;

  await kv.put(key, String(count), {
    expirationTtl: getWindowExpirationTtl(nowMs, reset),
  });

  return buildRateLimitState(count, reset);
}

interface MemoryKvEntry {
  expiration?: number;
  value: string;
}

export function createMemoryKvNamespace(): KVNamespace {
  const store = new Map<string, MemoryKvEntry>();

  const isExpired = (entry: MemoryKvEntry): boolean =>
    entry.expiration !== undefined && entry.expiration <= Date.now() / 1000;

  return {
    delete: async (key: string) => {
      store.delete(key);
    },
    get: async (key: string) => {
      const entry = store.get(key);
      if (!entry || isExpired(entry)) {
        store.delete(key);
        return null;
      }

      return entry.value;
    },
    getWithMetadata: async (key: string) => {
      const entry = store.get(key);
      if (!entry || isExpired(entry)) {
        store.delete(key);
        return { metadata: null, value: null };
      }

      return { metadata: null, value: entry.value };
    },
    list: async () => ({
      cacheStatus: null,
      keys: [],
      list_complete: true,
    }),
    put: async (
      key: string,
      value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
      options?: KVNamespacePutOptions
    ) => {
      const expiration =
        options?.expiration !== undefined
          ? options.expiration
          : options?.expirationTtl !== undefined
            ? Math.floor(Date.now() / 1000) + options.expirationTtl
            : undefined;

      store.set(key, {
        expiration,
        value: typeof value === 'string' ? value : String(value),
      });
    },
  } as unknown as KVNamespace;
}
