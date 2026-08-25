import { describe, expect, it, vi } from 'vitest';

vi.mock('@zerosend/env/server', () => ({
  env: {
    ADMIN_TOKEN: 'test-admin-token',
    SESSION_SECRET: 'test-session-secret-with-enough-length',
  },
}));

import {
  generateApiKey,
  getApiKeyPrefix,
  hashApiKey,
  parseApiKeyType,
} from './api-key-crypto';
import {
  createAdminSessionToken,
  timingSafeEqual,
  verifyAdminSessionToken,
} from './session';

describe('api key crypto', () => {
  it('generates live keys with zs_live_ prefix', () => {
    const key = generateApiKey('live');
    expect(key.startsWith('zs_live_')).toBe(true);
    expect(getApiKeyPrefix(key)).toBe(key.slice(0, 'zs_live_'.length + 8));
  });

  it('generates test keys with zs_test_ prefix', () => {
    const key = generateApiKey('test');
    expect(key.startsWith('zs_test_')).toBe(true);
    expect(getApiKeyPrefix(key)).toBe(key.slice(0, 'zs_test_'.length + 8));
  });

  it('parses key types from prefixes', () => {
    expect(parseApiKeyType('zs_test_abc123')).toBe('test');
    expect(parseApiKeyType('zs_live_abc123')).toBe('live');
    expect(parseApiKeyType('invalid_key')).toBe(null);
  });

  it('hashes keys deterministically', async () => {
    const key = 'zs_live_testkey1234567890abcdef';
    const hashA = await hashApiKey(key);
    const hashB = await hashApiKey(key);
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });
});

describe('session', () => {
  it('round-trips admin session tokens', async () => {
    const token = await createAdminSessionToken();
    const principal = await verifyAdminSessionToken(token);

    expect(principal).toEqual({
      id: 'admin',
      kind: 'admin',
      scopes: ['admin'],
    });
  });
});

describe('timingSafeEqual', () => {
  it('compares strings safely', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });
});
