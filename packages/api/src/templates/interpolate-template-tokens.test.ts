import { describe, expect, it } from 'vitest';

import { interpolateTemplateTokens } from './interpolate-template-tokens';

describe('interpolateTemplateTokens', () => {
  it('substitutes known variables', () => {
    const result = interpolateTemplateTokens('Hello {{{name}}}', {
      name: 'Ada',
    });

    expect(result).toBe('Hello Ada');
  });

  it('leaves unknown variables unchanged', () => {
    const result = interpolateTemplateTokens('Hello {{{name}}}', {});

    expect(result).toBe('Hello {{{name}}}');
  });

  it('escapes html values when requested', () => {
    const result = interpolateTemplateTokens(
      '<p>{{{name}}}</p>',
      {
        name: 'Tom & Jerry',
      },
      { escapeHtml: true }
    );

    expect(result).toBe('<p>Tom &amp; Jerry</p>');
  });

  it('does not escape html values by default', () => {
    const result = interpolateTemplateTokens('{{{cta}}}', {
      cta: 'Tom & Jerry',
    });

    expect(result).toBe('Tom & Jerry');
  });
});
