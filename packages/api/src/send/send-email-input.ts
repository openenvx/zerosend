import { z } from 'zod';

const MAX_BODY_LENGTH = 100_000;
const MAX_FROM_NAME_LENGTH = 200;
const MAX_RECIPIENTS = 50;

function dedupeRecipients(list: string[]): string[] {
  const seen = new Set<string>();
  const recipients: string[] = [];

  for (const address of list) {
    const key = address.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      recipients.push(address);
    }
  }

  return recipients;
}

const toFieldSchema = z
  .union([
    z.string().email(),
    z.array(z.string().email()).min(1).max(MAX_RECIPIENTS),
  ])
  .transform((to) => dedupeRecipients(Array.isArray(to) ? to : [to]));

export const sendEmailInputSchema = z
  .object({
    from: z.string().email().optional(),
    fromName: z.string().trim().min(1).max(MAX_FROM_NAME_LENGTH).optional(),
    html: z.string().max(MAX_BODY_LENGTH).optional(),
    replyTo: z.string().email().optional(),
    subject: z.string().trim().min(1).max(500),
    text: z.string().max(MAX_BODY_LENGTH).optional(),
    to: toFieldSchema,
  })
  .refine(
    (value) =>
      (value.html?.trim().length ?? 0) > 0 ||
      (value.text?.trim().length ?? 0) > 0,
    {
      message: 'Either html or text is required',
      path: ['html'],
    }
  );

export type SendEmailInput = z.infer<typeof sendEmailInputSchema>;

export function normalizeRecipients(to: string | string[]): string[] {
  return dedupeRecipients(Array.isArray(to) ? to : [to]);
}

export function formatToAddressForLog(to: string[]): string {
  return to.join(', ');
}
