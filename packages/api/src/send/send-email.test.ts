import { describe, expect, it, vi } from 'vitest';

import type { SendEmailBinding } from './email-binding';
import { MissingFromAddressError, SendEmailDeliveryError } from './errors';
import { sendEmail } from './send-email';
import { sendEmailInputSchema } from './send-email-input';
import { storeTestEmail } from './store-test-email';

function createMockDb(options: {
  defaultFrom?: string | null;
  onInsert?: (values: Record<string, unknown>) => void;
}) {
  const insertedValues: Record<string, unknown>[] = [];

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
          limit: () =>
            Promise.resolve(
              options.defaultFrom ? [{ defaultFrom: options.defaultFrom }] : []
            ),
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
  });

  it('accepts payloads without from for live default-from resolution', () => {
    const result = sendEmailInputSchema.safeParse({
      subject: 'Hello',
      text: 'Hi',
      to: 'user@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects payloads without html or text', () => {
    const result = sendEmailInputSchema.safeParse({
      from: 'hello@example.com',
      subject: 'Hello',
      to: 'user@example.com',
    });

    expect(result.success).toBe(false);
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
        to: 'user@example.com',
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_live_abc',
        keyType: 'live',
      },
      { emailBinding }
    );

    expect(result.id).toBeDefined();
    expect(send).toHaveBeenCalledWith({
      from: 'hello@example.com',
      html: '<p>Hi</p>',
      subject: 'Hello',
      text: undefined,
      to: 'user@example.com',
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

  it('uses defaultFrom when from is omitted', async () => {
    const send = vi.fn().mockResolvedValue({ messageId: 'cf-msg-456' });
    const emailBinding: SendEmailBinding = { send };
    const { mockDb } = createMockDb({ defaultFrom: 'noreply@example.com' });

    await sendEmail(
      mockDb,
      {
        subject: 'Hello',
        text: 'Hi',
        to: 'user@example.com',
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_live_abc',
        keyType: 'live',
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
    const { mockDb } = createMockDb({});

    await expect(
      sendEmail(
        mockDb,
        {
          subject: 'Hello',
          text: 'Hi',
          to: 'user@example.com',
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_live_abc',
          keyType: 'live',
        },
        { emailBinding }
      )
    ).rejects.toBeInstanceOf(MissingFromAddressError);

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
          to: 'user@example.com',
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_live_abc',
          keyType: 'live',
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
          to: 'user@example.com',
        },
        {
          keyId: 'key-id',
          keyPrefix: 'zs_test_abc',
          keyType: 'test',
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
        to: 'user@example.com',
      },
      {
        keyId: 'key-id',
        keyPrefix: 'zs_test_abc',
        keyType: 'test',
      },
      { emailBinding }
    );

    expect(send).not.toHaveBeenCalled();
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
        to: 'user@example.com',
      },
      {
        keyId: 'key-123',
        keyPrefix: 'zs_test_abc',
        keyType: 'test',
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
      status: 'sent',
      subject: 'Hello',
      textBody: null,
      toAddress: 'user@example.com',
    });
  });
});
