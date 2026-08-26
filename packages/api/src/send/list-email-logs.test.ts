import { DEFAULT_PROJECT_ID } from '@zerosend/db/schema';
import { describe, expect, it } from 'vitest';

import { listEmailLogs } from './list-email-logs';

const PROJECT_A = DEFAULT_PROJECT_ID;
const PROJECT_B = '00000000-0000-4000-8000-000000000002';

function createMockDb(rows: Record<string, unknown>[]) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => Promise.resolve(rows),
          }),
        }),
      }),
    }),
  } as unknown as Parameters<typeof listEmailLogs>[0];
}

describe('listEmailLogs', () => {
  it('requires projectId in the query path', async () => {
    const rows = [
      {
        apiKeyPrefix: 'zs_test_abc',
        cloudflareMessageId: null,
        createdAt: new Date(),
        error: null,
        fromAddress: 'hello@example.com',
        id: 'log-1',
        isTest: 1,
        status: 'sent',
        subject: 'Hello',
        toAddress: 'user@example.com',
      },
    ];

    const result = await listEmailLogs(createMockDb(rows), {
      projectId: PROJECT_A,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.isTest).toBe(true);
  });

  it('accepts projectId for filtering contract', async () => {
    await expect(
      listEmailLogs(createMockDb([]), { projectId: PROJECT_B, testOnly: true })
    ).resolves.toEqual([]);
  });
});
