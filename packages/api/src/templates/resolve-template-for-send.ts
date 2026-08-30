import type { createDb } from '@zerosend/db';
import { templates } from '@zerosend/db/schema';
import { and, eq } from 'drizzle-orm';

import { TemplateNotFoundError, TemplateNotPublishedError } from './errors';
import { interpolateTemplateTokens } from './interpolate-template-tokens';

type Db = ReturnType<typeof createDb>;

interface ResolveTemplateForSendBase {
  projectId: string;
  variables: Record<string, string>;
  subject?: string;
}

export type ResolveTemplateForSendInput =
  | (ResolveTemplateForSendBase & { templateId: string })
  | (ResolveTemplateForSendBase & { templateKey: string });

export interface ResolvedTemplateSend {
  html: string;
  subject?: string;
  text: string;
  templateId: string;
}

function getLookup(input: ResolveTemplateForSendInput): {
  column: 'id' | 'key';
  value: string;
} {
  if ('templateId' in input) {
    return { column: 'id', value: input.templateId };
  }

  return { column: 'key', value: input.templateKey };
}

function getNotFoundIdentifier(input: ResolveTemplateForSendInput): string {
  return 'templateId' in input ? input.templateId : input.templateKey;
}

export async function resolveTemplateForSend(
  db: Db,
  input: ResolveTemplateForSendInput
): Promise<ResolvedTemplateSend> {
  const lookup = getLookup(input);
  const identifier = getNotFoundIdentifier(input);

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
        lookup.column === 'id'
          ? eq(templates.id, lookup.value)
          : eq(templates.key, lookup.value),
        eq(templates.projectId, input.projectId)
      )
    )
    .limit(1);

  if (!row) {
    throw new TemplateNotFoundError(identifier);
  }

  if (
    row.publishedAt === null ||
    row.htmlSnapshot === null ||
    row.textSnapshot === null
  ) {
    throw new TemplateNotPublishedError(identifier);
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
