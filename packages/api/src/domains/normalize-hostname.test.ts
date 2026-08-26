import { describe, expect, it } from 'vitest';

import { parseEmailHost } from './normalize-hostname';

describe('normalize-hostname', () => {
  it('parses email hosts in lowercase', () => {
    expect(parseEmailHost('Hello@Mail.Example.COM')).toBe('mail.example.com');
  });

  it('returns null for invalid addresses', () => {
    expect(parseEmailHost('not-an-email')).toBeNull();
    expect(parseEmailHost('@example.com')).toBeNull();
  });
});
