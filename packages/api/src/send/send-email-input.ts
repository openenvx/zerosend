import { z } from 'zod';

const MAX_BODY_LENGTH = 100_000;
const MAX_FROM_NAME_LENGTH = 200;
const MAX_RECIPIENTS = 50;
const MAX_TEMPLATE_VARIABLES = 100;
const MAX_TEMPLATE_VARIABLE_VALUE_LENGTH = 10_000;

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

export const sendEmailTemplateSchema = z.object({
  id: z.string().uuid(),
  variables: z.record(z.string(), z.string()).optional(),
});

const sendEmailBodyFieldsSchema = z.object({
  from: z.string().email().optional(),
  fromName: z.string().trim().min(1).max(MAX_FROM_NAME_LENGTH).optional(),
  html: z.string().max(MAX_BODY_LENGTH).optional(),
  replyTo: z.string().email().optional(),
  subject: z.string().trim().min(1).max(500),
  template: sendEmailTemplateSchema.optional(),
  text: z.string().max(MAX_BODY_LENGTH).optional(),
  to: toFieldSchema,
});

export const sendEmailInputSchema = sendEmailBodyFieldsSchema.superRefine(
  (value, ctx) => {
    const hasTemplate = value.template !== undefined;
    const hasHtml = (value.html?.trim().length ?? 0) > 0;
    const hasText = (value.text?.trim().length ?? 0) > 0;
    const hasBody = hasHtml || hasText;
    const variables = value.template?.variables ?? {};

    if (Object.keys(variables).length > MAX_TEMPLATE_VARIABLES) {
      ctx.addIssue({
        code: 'custom',
        message: `At most ${MAX_TEMPLATE_VARIABLES} template variables are allowed`,
        path: ['template', 'variables'],
      });
    }

    for (const [key, variableValue] of Object.entries(variables)) {
      if (key.trim().length === 0 || key.length > 120) {
        ctx.addIssue({
          code: 'custom',
          message: 'Template variable keys must be 1-120 characters',
          path: ['template', 'variables', key],
        });
      }

      if (variableValue.length > MAX_TEMPLATE_VARIABLE_VALUE_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          message: `Template variable values must be at most ${MAX_TEMPLATE_VARIABLE_VALUE_LENGTH} characters`,
          path: ['template', 'variables', key],
        });
      }
    }

    if (hasTemplate && hasBody) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide either template or html/text, not both',
        path: ['template'],
      });
      return;
    }

    if (!hasTemplate && !hasBody) {
      ctx.addIssue({
        code: 'custom',
        message: 'Either template or html/text is required',
        path: ['html'],
      });
    }
  }
);

export type SendEmailInput = z.infer<typeof sendEmailInputSchema>;
export type SendEmailTemplateInput = z.infer<typeof sendEmailTemplateSchema>;

export type ResolvedSendEmailInput = Omit<SendEmailInput, 'template'> & {
  templateId?: string;
};

export function normalizeRecipients(to: string | string[]): string[] {
  return dedupeRecipients(Array.isArray(to) ? to : [to]);
}

export function formatToAddressForLog(to: string[]): string {
  return to.join(', ');
}
