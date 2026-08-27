import { apiLogger } from '../logging/evlog';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

const PERMISSION_HINT =
  'Cloudflare token is missing permission for Email Sending Subdomains. Required: Account Email Security Edit; Zone Email Routing Rules Edit; Zone Read; DNS Read/Write.';

export interface CloudflareZone {
  id: string;
  name: string;
  status: string;
}

export interface CloudflareSendingSubdomain {
  enabled: boolean;
  name: string;
  tag: string;
  created?: string;
  dkim_selector?: string;
  modified?: string;
  preview_enabled?: boolean;
  return_path_domain?: string;
}

export interface CloudflareDnsRecord {
  content?: string;
  name?: string;
  priority?: number;
  ttl?: number;
  type?: string;
}

interface CloudflareApiEnvelope<T> {
  errors?: { code: number; message: string }[];
  result: T;
  success: boolean;
}

export class CloudflareApiError extends Error {
  readonly code: number;
  readonly path: string;
  readonly status: number;

  constructor(message: string, status: number, code: number, path: string) {
    super(message);
    this.name = 'CloudflareApiError';
    this.status = status;
    this.code = code;
    this.path = path;
  }

  isPermissionError(): boolean {
    return (
      this.status === 401 ||
      this.status === 403 ||
      this.code === 10_000 ||
      this.code === 9109
    );
  }
}

export class CloudflareTokenMissingError extends Error {
  constructor() {
    super('CF_API_TOKEN is not configured');
    this.name = 'CloudflareTokenMissingError';
  }
}

export function getCloudflarePermissionHint(): string {
  return PERMISSION_HINT;
}

async function cfFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${CF_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = (await response.json()) as CloudflareApiEnvelope<T>;
  if (!body.success) {
    const firstError = body.errors?.[0];
    apiLogger.warn({
      action: 'cloudflare_api_error',
      code: firstError?.code ?? 0,
      message: firstError?.message ?? 'Cloudflare API request failed',
      path,
      status: response.status,
    });
    throw new CloudflareApiError(
      firstError?.message ?? 'Cloudflare API request failed',
      response.status,
      firstError?.code ?? 0,
      path
    );
  }

  return body.result;
}

export async function getZoneByHostname(
  hostname: string,
  token: string
): Promise<CloudflareZone | null> {
  const labels = hostname.toLowerCase().split('.');
  for (let index = 0; index < labels.length - 1; index += 1) {
    const candidate = labels.slice(index).join('.');
    const zones = await cfFetch<CloudflareZone[]>(
      `/zones?name=${encodeURIComponent(candidate)}&status=active`,
      token
    );
    const zone = zones.find((entry) => entry.name === candidate);
    if (zone) {
      return zone;
    }
  }

  return null;
}

export async function listSendingSubdomains(
  zoneId: string,
  token: string
): Promise<CloudflareSendingSubdomain[]> {
  return cfFetch<CloudflareSendingSubdomain[]>(
    `/zones/${zoneId}/email/sending/subdomains`,
    token
  );
}

export async function createSendingSubdomain(
  zoneId: string,
  name: string,
  token: string
): Promise<CloudflareSendingSubdomain> {
  return cfFetch<CloudflareSendingSubdomain>(
    `/zones/${zoneId}/email/sending/subdomains`,
    token,
    {
      body: JSON.stringify({ name }),
      method: 'POST',
    }
  );
}

export async function getSendingSubdomain(
  zoneId: string,
  subdomainId: string,
  token: string
): Promise<CloudflareSendingSubdomain> {
  return cfFetch<CloudflareSendingSubdomain>(
    `/zones/${zoneId}/email/sending/subdomains/${subdomainId}`,
    token
  );
}

export async function getSubdomainDnsRecords(
  zoneId: string,
  subdomainId: string,
  token: string
): Promise<CloudflareDnsRecord[]> {
  return cfFetch<CloudflareDnsRecord[]>(
    `/zones/${zoneId}/email/sending/subdomains/${subdomainId}/dns`,
    token
  );
}

export async function provisionSendingSubdomain(
  zoneId: string,
  name: string,
  token: string
): Promise<CloudflareSendingSubdomain> {
  const existing = await listSendingSubdomains(zoneId, token);
  const match = existing.find((entry) => entry.name === name);
  if (match) {
    return match;
  }

  return createSendingSubdomain(zoneId, name, token);
}
