import type { ApiKeyType } from './types';

const API_KEY_PREFIXES: Record<ApiKeyType, string> = {
  live: 'zs_live_',
  test: 'zs_test_',
};

const PREFIX_DISPLAY_LENGTH = 8;

export function parseApiKeyType(rawKey: string): ApiKeyType | null {
  if (rawKey.startsWith(API_KEY_PREFIXES.test)) {
    return 'test';
  }

  if (rawKey.startsWith(API_KEY_PREFIXES.live)) {
    return 'live';
  }

  return null;
}

export function generateApiKey(type: ApiKeyType = 'live'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const secret = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  return `${API_KEY_PREFIXES[type]}${secret}`;
}

export function getApiKeyPrefix(rawKey: string): string {
  const keyType = parseApiKeyType(rawKey);
  if (!keyType) {
    throw new Error('Invalid API key prefix');
  }

  return rawKey.slice(
    0,
    API_KEY_PREFIXES[keyType].length + PREFIX_DISPLAY_LENGTH
  );
}

export async function hashApiKey(rawKey: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(rawKey)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}
