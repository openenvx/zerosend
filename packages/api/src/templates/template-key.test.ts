import { describe, expect, it } from 'vitest';

import { slugifyTemplateKey, templateKeySchema } from './template-key';

describe('templateKeySchema', () => {
  it('accepts valid keys', () => {
    expect(templateKeySchema.safeParse('welcome-email').success).toBe(true);
    expect(templateKeySchema.safeParse('a1').success).toBe(true);
  });

  it('rejects invalid keys', () => {
    expect(templateKeySchema.safeParse('Welcome').success).toBe(false);
    expect(templateKeySchema.safeParse('1bad').success).toBe(false);
    expect(templateKeySchema.safeParse('').success).toBe(false);
  });
});

describe('slugifyTemplateKey', () => {
  it('slugifies display names', () => {
    expect(slugifyTemplateKey('Welcome email')).toBe('welcome-email');
    expect(slugifyTemplateKey('  Hello   World!  ')).toBe('hello-world');
  });

  it('prefixes when the slug does not start with a letter', () => {
    expect(slugifyTemplateKey('123')).toBe('t-123');
  });

  it('falls back for empty names', () => {
    expect(slugifyTemplateKey('   ')).toBe('template');
  });
});
