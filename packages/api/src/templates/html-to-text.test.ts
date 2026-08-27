import { describe, expect, it } from 'vitest';

import { htmlToText } from './html-to-text';

describe('htmlToText', () => {
  it('strips tags and preserves paragraph breaks', () => {
    const text = htmlToText(
      '<p>Hello <strong>Ada</strong></p><p>Welcome back</p>'
    );

    expect(text).toBe('Hello Ada\n\nWelcome back');
  });

  it('decodes common entities', () => {
    const text = htmlToText('<p>Tom &amp; Jerry</p>');

    expect(text).toBe('Tom & Jerry');
  });
});
