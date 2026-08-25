import { z } from 'zod';

const MAX_BODY_LENGTH = 100_000;

export const sendEmailInputSchema = z
  .object({
    from: z.string().email().optional(),
    html: z.string().max(MAX_BODY_LENGTH).optional(),
    subject: z.string().trim().min(1).max(500),
    text: z.string().max(MAX_BODY_LENGTH).optional(),
    to: z.string().email(),
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
