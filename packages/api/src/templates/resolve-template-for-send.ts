import type { createDb } from '@zerosend/db';
import { templates } from '@zerosend/db/schema';
import { and, eq } from 'drizzle-orm';

import { TemplateNotFoundError, TemplateNotPublishedError } from './errors';
import { interpolateTemplateTokens } from './interpolate-template-tokens';

type Db = ReturnType<typeof createDb>;

export interface ResolveTemplateForSendInput {
  projectId: string;
  templateId: string;
  variables: Record<string, string>;
  subject?: string;
}

export interface ResolvedTemplateSend {
  html: string;
  subject?: string;
  text: string;
  templateId: string;
}

export async function resolveTemplateForSend(
  db: Db,
  input: ResolveTemplateForSendInput
): Promise<ResolvedTemplateSend> {
  const [row] = await db
    .select({
      htmlSnapshot: templates.htmlSnapshot,
      id: templates.id,
      publishedAt: templates.publishedAt,
      textSnapshot: templates.textSnapshot,
    })
    .from(templates)
    .where(
      and(
        eq(templates.id, input.templateId),
        eq(templates.projectId, input.projectId)
      )
    )
    .limit(1);

  if (!row) {
    throw new TemplateNotFoundError(input.templateId);
  }

  if (
    row.publishedAt === null ||
    row.htmlSnapshot === null ||
    row.textSnapshot === null
  ) {
    throw new TemplateNotPublishedError(input.templateId);
  }

  const html = interpolateTemplateTokens(row.htmlSnapshot, input.variables, {
    escapeHtml: true,
  });
  const text = interpolateTemplateTokens(row.textSnapshot, input.variables);
  const subject =
    input.subject === undefined
      ? undefined
      : interpolateTemplateTokens(input.subject, input.variables);

  return {
    html,
    subject,
    templateId: row.id,
    text,
  };
}
