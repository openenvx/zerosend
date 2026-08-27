export const TEMPLATE_TOKEN_CAPTURE_RE = /\{\{\{([A-Za-z][A-Za-z0-9_]*)\}\}\}/g;

export interface InterpolateTemplateTokensOptions {
  escapeHtml?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function interpolateTemplateTokens(
  text: string,
  variables: Record<string, string>,
  options: InterpolateTemplateTokensOptions = {}
): string {
  if (Object.keys(variables).length === 0) {
    return text;
  }

  const escapeValues = options.escapeHtml ?? false;

  return text.replace(TEMPLATE_TOKEN_CAPTURE_RE, (match, key: string) => {
    const value = variables[key];
    if (value === undefined) {
      return match;
    }

    return escapeValues ? escapeHtml(value) : value;
  });
}

export function extractTemplateTokenKeys(text: string): string[] {
  const keys: string[] = [];

  for (const match of text.matchAll(TEMPLATE_TOKEN_CAPTURE_RE)) {
    keys.push(match[1]!);
  }

  return keys;
}
