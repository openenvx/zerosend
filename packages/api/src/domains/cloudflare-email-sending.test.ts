import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CloudflareApiError,
  createSendingSubdomain,
  getZoneByHostname,
  listSendingSubdomains,
  provisionSendingSubdomain,
} from './cloudflare-email-sending';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockCloudflareResponse(result: unknown, success = true, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    json: async () => ({
      errors: success ? [] : [{ code: 10_000, message: 'permission denied' }],
      result,
      success,
    }),
    status,
  }) as typeof fetch;
}

describe('cloudflare-email-sending', () => {
  it('finds a zone by walking parent hostnames', async () => {
    mockCloudflareResponse([
      { id: 'zone-1', name: 'example.com', status: 'active' },
    ]);

    const zone = await getZoneByHostname('mail.example.com', 'token');
    expect(zone?.id).toBe('zone-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('name=mail.example.com'),
      expect.any(Object)
    );
  });

  it('reuses an existing sending subdomain when present', async () => {
    mockCloudflareResponse([
      {
        enabled: true,
        name: 'example.com',
        tag: 'subdomain-tag',
      },
    ]);

    const subdomain = await provisionSendingSubdomain(
      'zone-1',
      'example.com',
      'token'
    );

    expect(subdomain.tag).toBe('subdomain-tag');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('creates a sending subdomain when none exists', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          errors: [],
          result: [],
          success: true,
        }),
        status: 200,
      })
      .mockResolvedValueOnce({
        json: async () => ({
          errors: [],
          result: {
            enabled: false,
            name: 'example.com',
            tag: 'new-tag',
          },
          success: true,
        }),
        status: 200,
      }) as typeof fetch;

    const subdomain = await provisionSendingSubdomain(
      'zone-1',
      'example.com',
      'token'
    );

    expect(subdomain.tag).toBe('new-tag');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('throws CloudflareApiError on permission failures', async () => {
    mockCloudflareResponse(null, false, 403);

    await expect(
      listSendingSubdomains('zone-1', 'token')
    ).rejects.toBeInstanceOf(CloudflareApiError);
  });

  it('creates sending subdomains via POST', async () => {
    mockCloudflareResponse({
      enabled: true,
      name: 'mail.example.com',
      tag: 'created-tag',
    });

    const created = await createSendingSubdomain(
      'zone-1',
      'mail.example.com',
      'token'
    );

    expect(created.tag).toBe('created-tag');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/email/sending/subdomains'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
