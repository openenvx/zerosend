import { z } from 'zod';

export const MAX_TEMPLATE_KEY_LENGTH = 64;

export const templateKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_TEMPLATE_KEY_LENGTH)
  .regex(
    /^[a-z][a-z0-9-]*$/,
    'Key must start with a letter and contain only lowercase letters, numbers, and hyphens'
  );

/** Slugify a display name into a valid template key. */
export function slugifyTemplateKey(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/-+/g, '-')
    .slice(0, MAX_TEMPLATE_KEY_LENGTH);

  if (!slug) {
    return 'template';
  }

  if (/^[a-z]/.test(slug)) {
    return slug;
  }

  return `t-${slug}`.slice(0, MAX_TEMPLATE_KEY_LENGTH);
}
