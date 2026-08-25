export const appName = 'Zerosend';
export const docsRoute = '/docs';

export const gitConfig = {
  user: 'openenvx',
  repo: 'zerosend',
  branch: 'main',
};

export function encodeMarkdownUrl(slugs: string[], locale?: string) {
  const segments = [...slugs];
  if (segments.length === 0) {
    segments.push('index.md');
  } else {
    segments[segments.length - 1] += '.md';
  }

  return `/${[locale, ...docsRoute.split('/'), ...segments].filter(Boolean).join('/')}`;
}

export function decodeMarkdownUrl(segments: string[]) {
  if (segments.length === 0) {
    return [];
  }

  const out = [...segments];
  const last = out.at(-1);
  if (last) {
    out[out.length - 1] = last.replace(/\.md$/, '');
  }
  if (out.length === 1 && out[0] === 'index') {
    out.pop();
  }
  return out;
}
