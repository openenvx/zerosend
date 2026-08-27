import { describe, expect, it } from 'vitest';

import { TemplateNotFoundError, TemplateNotPublishedError } from './errors';
import { resolveTemplateForSend } from './resolve-template-for-send';

interface TemplateRow {
  id: string;
  projectId: string;
  publishedAt: Date | null;
  htmlSnapshot: string | null;
  textSnapshot: string | null;
}

function createTemplatesDb(rows: TemplateRow[]) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(rows.length > 0 ? [rows[0]!] : []),
        }),
      }),
    }),
  };
}

describe('resolveTemplateForSend', () => {
  it('throws when template is missing', async () => {
    const db = createTemplatesDb([]);

    await expect(
      resolveTemplateForSend(db as never, {
        projectId: '00000000-0000-4000-8000-000000000001',
        templateId: '00000000-0000-4000-8000-000000000099',
        variables: {},
      })
    ).rejects.toBeInstanceOf(TemplateNotFoundError);
  });

  it('throws when template is not published', async () => {
    const db = createTemplatesDb([
      {
        htmlSnapshot: null,
        id: '00000000-0000-4000-8000-000000000010',
        projectId: '00000000-0000-4000-8000-000000000001',
        publishedAt: null,
        textSnapshot: null,
      },
    ]);

    await expect(
      resolveTemplateForSend(db as never, {
        projectId: '00000000-0000-4000-8000-000000000001',
        templateId: '00000000-0000-4000-8000-000000000010',
        variables: {},
      })
    ).rejects.toBeInstanceOf(TemplateNotPublishedError);
  });

  it('interpolates published snapshots', async () => {
    const db = createTemplatesDb([
      {
        htmlSnapshot: '<p>Hello {{{name}}}</p>',
        id: '00000000-0000-4000-8000-000000000010',
        projectId: '00000000-0000-4000-8000-000000000001',
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        textSnapshot: 'Hello {{{name}}}',
      },
    ]);

    const result = await resolveTemplateForSend(db as never, {
      projectId: '00000000-0000-4000-8000-000000000001',
      subject: 'Welcome {{{name}}}',
      templateId: '00000000-0000-4000-8000-000000000010',
      variables: { name: 'Ada' },
    });

    expect(result.html).toBe('<p>Hello Ada</p>');
    expect(result.text).toBe('Hello Ada');
    expect(result.subject).toBe('Welcome Ada');
    expect(result.templateId).toBe('00000000-0000-4000-8000-000000000010');
  });
});
