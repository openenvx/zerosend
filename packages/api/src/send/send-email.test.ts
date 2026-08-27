import { describe, expect, it, vi } from 'vitest';

import { buildSendEmailMessage } from './build-send-message';
import type { SendEmailBinding } from './email-binding';
import {
  MissingFromAddressError,
  SendEmailDeliveryError,
  UnverifiedFromDomainError,
} from './errors';
import { sendEmail } from './send-email';
import { normalizeRecipients, sendEmailInputSchema } from './send-email-input';
import { storeTestEmail } from './store-test-email';

const TEST_PROJECT_ID = '00000000-0000-4000-8000-000000000001';

function createMockDb(options: {
  defaultFrom?: string | null;
  domainRows?: {
    id: string;
    name: string;
    verified: number;
  }[];
  onInsert?: (values: Record<string, unknown>) => void;
  withVerifiedDomain?: boolean;
}) {
  const insertedValues: Record<string, unknown>[] = [];
  const selectQueue: unknown[][] = [];

  if ('defaultFrom' in options) {
    selectQueue.push(
      options.defaultFrom ? [{ defaultFrom: options.defaultFrom }] : []
    );
  }

  if (options.domainRows !== undefined) {
    selectQueue.push(options.domainRows);
  } else if (options.withVerifiedDomain ?? true) {
    selectQueue.push([
      {
        id: 'domain-1',
        name: 'example.com',
        verified: 1,
      },
    ]);
  }

  let selectIndex = 0;

  const mockDb = {
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        insertedValues.push(values);
        options.onInsert?.(values);
        return Promise.resolve();
      },
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => {
            const result = selectQueue[selectIndex] ?? [];
            selectIndex += 1;
            return Promise.resolve(result);
          },
        }),
      }),
    }),
  } as unknown as Parameters<typeof sendEmail>[0];

  return { insertedValues, mockDb };
}

describe('sendEmailInputSchema', () => {
  it('accepts html-only payloads', () => {
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to: 'user@example.com',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.to).toEqual(['user@example.com']);
    }
  });

  it('accepts payloads without from for live default-from resolution', () => {
    const result = sendEmailInputSchema.safeParse({
      subject: 'Hello',
      text: 'Hi',
      to: 'user@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('accepts to as an array', () => {
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to: ['user1@example.com', 'user2@example.com'],
    });

    expect(result.success).toBe(true);
  });

  it('accepts fromName and replyTo', () => {
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      fromName: 'Hello Team',
      html: '<p>Hi</p>',
      replyTo: 'support@example.com',
      subject: 'Hello',
      to: 'user@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects more than 50 recipients', () => {
    const to = Array.from(
      { length: 51 },
      (_, index) => `user${index}@example.com`
    );
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to,
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty recipient arrays', () => {
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects payloads without html or text', () => {
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      subject: 'Hello',
      to: 'user@example.com',
    });

    expect(result.success).toBe(false);
  });

  it('accepts template sends without html or text', () => {
    const result = sendEmailInputSchema.safeParse({
      subject: 'Hello {{{name}}}',
      template: {
        id: '00000000-0000-4000-8000-000000000010',
        variables: { name: 'Ada' },
      },
      to: 'user@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects template and html together', () => {
    const result = sendEmailInputSchema.safeParse({
      html: '<p>Hello</p>',
      subject: 'Hello',
      template: {
        id: '00000000-0000-4000-8000-000000000010',
        variables: {},
      },
      to: 'user@example.com',
    });

    expect(result.success).toBe(false);
  });
});

describe('normalizeRecipients', () => {
  it('dedupes addresses case-insensitively while preserving first casing', () => {
    expect(
      normalizeRecipients([
        'User@Example.com',
        'user@example.com',
        'Other@Example.com',
      ])
    ).toEqual(['User@Example.com', 'Other@Example.com']);
  });

  it('wraps a single address in an array', () => {
    expect(normalizeRecipients('user@example.com')).toEqual([
      'user@example.com',
    ]);
  });
});

describe('buildSendEmailMessage', () => {
  it('maps fromName and replyTo to the email binding payload', () => {
    const message = buildSendEmailMessage(
      {
        from: 'hello@example.com',
        fromName: 'Hello Team',
        html: '<p>Hi</p>',
        replyTo: 'support@example.com',
        subject: 'Hello',
        to: ['user1@example.com', 'user2@example.com'],
      },
      'hello@example.com'
    );

    expect(message).toEqual({
      from: { email: 'hello@example.com', name: 'Hello Team' },
      html: '<p>Hi</p>',
      replyTo: 'support@example.com',
      subject: 'Hello',
      to: ['user1@example.com', 'user2@example.com'],
    });
  });
});

describe('sendEmail live path', () => {
  it('sends live email and stores metadata only', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'cf-msg-123' });
    const emailBinding: SendEmailBinding = { send };
    const { mockDb, insertedValues } = createMockDb({});

    const result = await sendEmail(
      mockDb,
      {
        from: 'hello@example.com',
        html: '<p>Hi</p>',
        subject: 'Hello',
        to: ['user@example.com'],
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_live_abc',
        keyType: 'live',
        projectId: TEST_PROJECT_ID,
      },
      { emailBinding }
    );

    expect(result.id).toBeDefined();
    expect(send).toHaveBeenCalledWith({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      to: ['user@example.com'],
    });
    expect(insertedValues[0]).toMatchObject({
      apiKeyPrefix: 'zs_live_abc',
      cloudflareMessageId: 'cf-msg-123',
      error: null,
      fromAddress: 'hello@example.com',
      htmlBody: null,
      isTest: 0,
      status: 'sent',
      subject: 'Hello',
      textBody: null,
      toAddress: 'user@example.com',
    });
  });

  it('succeeds when the email binding returns no messageId (local simulation)', async () => {
    const send = vi.fn().mockResolvedValue();
    const emailBinding: SendEmailBinding = { send };
    const { mockDb, insertedValues } = createMockDb({});

    const result = await sendEmail(
      mockDb,
      {
        from: 'hello@example.com',
        html: '<p>Hi</p>',
        subject: 'Hello',
        to: ['user@example.com'],
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_live_abc',
        keyType: 'live',
        projectId: TEST_PROJECT_ID,
      },
      { emailBinding }
    );

    expect(result.id).toBeDefined();
    expect(insertedValues[0]).toMatchObject({
      cloudflareMessageId: null,
      status: 'sent',
    });
  });

  it('sends one message with multiple recipients', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'cf-msg-multi' });
    const emailBinding: SendEmailBinding = { send };
    const { mockDb, insertedValues } = createMockDb({});

    await sendEmail(
      mockDb,
      {
        from: 'hello@example.com',
        html: '<p>Hi</p>',
        subject: 'Hello',
        to: ['user1@example.com', 'user2@example.com'],
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_live_abc',
        keyType: 'live',
        projectId: TEST_PROJECT_ID,
      },
      { emailBinding }
    );

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['user1@example.com', 'user2@example.com'],
      })
    );
    expect(insertedValues[0]).toMatchObject({
      toAddress: 'user1@example.com, user2@example.com',
    });
  });

  it('uses defaultFrom when from is omitted', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'cf-msg-456' });
    const emailBinding: SendEmailBinding = { send };
    const { mockDb } = createMockDb({ defaultFrom: 'noreply@example.com' });

    await sendEmail(
      mockDb,
      {
        subject: 'Hello',
        text: 'Hi',
        to: ['user@example.com'],
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_live_abc',
        keyType: 'live',
        projectId: TEST_PROJECT_ID,
      },
      { emailBinding }
    );

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'noreply@example.com' })
    );
  });

  it('throws MissingFromAddressError when from and default are missing', async () => {
    const send = vi.fn();
    const emailBinding: SendEmailBinding = { send };
    const { mockDb } = createMockDb({
      defaultFrom: null,
      withVerifiedDomain: false,
    });

    await expect(
      sendEmail(
        mockDb,
        {
          subject: 'Hello',
          text: 'Hi',
          to: ['user@example.com'],
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_live_abc',
          keyType: 'live',
          projectId: TEST_PROJECT_ID,
        },
        { emailBinding }
      )
    ).rejects.toBeInstanceOf(MissingFromAddressError);

    expect(send).not.toHaveBeenCalled();
  });

  it('rejects live send when from domain is not verified', async () => {
    const send = vi.fn();
    const emailBinding: SendEmailBinding = { send };
    const { mockDb } = createMockDb({
      domainRows: [
        {
          id: 'domain-1',
          name: 'example.com',
          verified: 0,
        },
      ],
    });

    await expect(
      sendEmail(
        mockDb,
        {
          from: 'hello@example.com',
          html: '<p>Hi</p>',
          subject: 'Hello',
          to: ['user@example.com'],
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_live_abc',
          keyType: 'live',
          projectId: TEST_PROJECT_ID,
        },
        { emailBinding }
      )
    ).rejects.toBeInstanceOf(UnverifiedFromDomainError);

    expect(send).not.toHaveBeenCalled();
  });

  it('stores failed live logs and throws SendEmailDeliveryError', async () => {
    const send = vi.fn().mockRejectedValue({
      code: 'E_SENDER_NOT_VERIFIED',
      message: 'Sender not verified',
    });
    const emailBinding: SendEmailBinding = { send };
    const { mockDb, insertedValues } = createMockDb({});

    await expect(
      sendEmail(
        mockDb,
        {
          from: 'hello@example.com',
          subject: 'Hello',
          text: 'Hi',
          to: ['user@example.com'],
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_live_abc',
          keyType: 'live',
          projectId: TEST_PROJECT_ID,
        },
        { emailBinding }
      )
    ).rejects.toMatchObject({
      code: 'E_SENDER_NOT_VERIFIED',
      httpStatus: 400,
      logId: expect.any(String),
      name: 'SendEmailDeliveryError',
    });

    expect(insertedValues[0]).toMatchObject({
      cloudflareMessageId: null,
      error: 'E_SENDER_NOT_VERIFIED: Sender not verified',
      isTest: 0,
      status: 'failed',
    });
  });
});

describe('sendEmail test path', () => {
  it('requires from for test keys', async () => {
    const send = vi.fn();
    const emailBinding: SendEmailBinding = { send };
    const { mockDb } = createMockDb({});

    await expect(
      sendEmail(
        mockDb,
        {
          subject: 'Hello',
          text: 'Hi',
          to: ['user@example.com'],
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_test_abc',
          keyType: 'test',
          projectId: TEST_PROJECT_ID,
        },
        { emailBinding }
      )
    ).rejects.toBeInstanceOf(MissingFromAddressError);

    expect(send).not.toHaveBeenCalled();
  });

  it('does not call the email binding for test keys', async () => {
    const send = vi.fn();
    const emailBinding: SendEmailBinding = { send };
    const mockDb = {
      insert: () => ({
        values: () => Promise.resolve(),
      }),
    } as unknown as Parameters<typeof storeTestEmail>[0];

    await sendEmail(
      mockDb,
      {
        from: 'hello@example.com',
        subject: 'Hello',
        text: 'Hi',
        to: ['user@example.com'],
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_test_abc',
        keyType: 'test',
        projectId: TEST_PROJECT_ID,
      },
      { emailBinding }
    );

    expect(send).not.toHaveBeenCalled();
  });

  it('stores joined recipients for test keys', async () => {
    const insertedValues: Record<string, unknown>[] = [];
    const mockDb = {
      insert: () => ({
        values: (values: Record<string, unknown>) => {
          insertedValues.push(values);
          return Promise.resolve();
        },
      }),
    } as unknown as Parameters<typeof storeTestEmail>[0];

    await storeTestEmail(
      mockDb,
      {
        from: 'hello@example.com',
        html: '<p>Hi</p>',
        subject: 'Hello',
        to: ['user1@example.com', 'user2@example.com'],
      },
      {
        keyId: 'key-123',
        keyPrefix: 'zs_test_abc',
        keyType: 'test',
        projectId: TEST_PROJECT_ID,
      }
    );

    expect(insertedValues[0]).toMatchObject({
      toAddress: 'user1@example.com, user2@example.com',
    });
  });
});

describe('SendEmailDeliveryError', () => {
  it('carries http status and log id', () => {
    const error = new SendEmailDeliveryError(
      'Sender not verified',
      'E_SENDER_NOT_VERIFIED',
      400,
      'log-123'
    );

    expect(error.httpStatus).toBe(400);
    expect(error.logId).toBe('log-123');
  });
});

describe('storeTestEmail', () => {
  it('inserts a test email log row', async () => {
    const insertedValues: Record<string, unknown>[] = [];
    const mockDb = {
      insert: () => ({
        values: (values: Record<string, unknown>) => {
          insertedValues.push(values);
          return Promise.resolve();
        },
      }),
    } as unknown as Parameters<typeof storeTestEmail>[0];

    const result = await storeTestEmail(
      mockDb,
      {
        from: 'hello@example.com',
        html: '<p>Hi</p>',
        subject: 'Hello',
        to: ['user@example.com'],
      },
      {
        keyId: 'key-123',
        keyPrefix: 'zs_test_abc',
        keyType: 'test',
        projectId: TEST_PROJECT_ID,
      }
    );

    expect(result.id).toBeDefined();
    expect(insertedValues[0]).toMatchObject({
      apiKeyId: 'key-123',
      apiKeyPrefix: 'zs_test_abc',
      error: null,
      fromAddress: 'hello@example.com',
      htmlBody: '<p>Hi</p>',
      isTest: 1,
      projectId: TEST_PROJECT_ID,
      status: 'sent',
      subject: 'Hello',
      textBody: null,
      toAddress: 'user@example.com',
    });
  });
});
