const BLOCK_BREAK_TAGS =
  /<\/?(?:p|div|br|tr|table|thead|tbody|tfoot|h[1-6]|li|ul|ol|blockquote|hr)[^>]*>/gi;
const TAG_RE = /<[^>]+>/g;
const WHITESPACE_RE = /\s+/g;

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function decodeHtmlEntities(text: string): string {
  return text.replaceAll(
    /&(#x?[0-9a-f]+|[a-z]+);/gi,
    (match, entity: string) => {
      if (entity.startsWith('#x') || entity.startsWith('#X')) {
        const codePoint = Number.parseInt(entity.slice(2), 16);
        return Number.isFinite(codePoint)
          ? String.fromCodePoint(codePoint)
          : match;
      }

      if (entity.startsWith('#')) {
        const codePoint = Number.parseInt(entity.slice(1), 10);
        return Number.isFinite(codePoint)
          ? String.fromCodePoint(codePoint)
          : match;
      }

      return HTML_ENTITIES[entity.toLowerCase()] ?? match;
    }
  );
}

export function htmlToText(html: string): string {
  const withBreaks = html.replace(BLOCK_BREAK_TAGS, '\n').replace(TAG_RE, '');

  return decodeHtmlEntities(withBreaks)
    .split('\n')
    .map((line) => line.replace(WHITESPACE_RE, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n\n');
}
