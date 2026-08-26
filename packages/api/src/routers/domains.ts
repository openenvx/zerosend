import { ORPCError } from '@orpc/server';
import { domains } from '@zerosend/db/schema';
import { env } from '@zerosend/env/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { isUniqueConstraintError } from '../db/is-unique-constraint-error';
import {
  CloudflareApiError,
  CloudflareTokenMissingError,
  getCloudflarePermissionHint,
  getSendingSubdomain,
  getSubdomainDnsRecords,
  getZoneByHostname,
  provisionSendingSubdomain,
} from '../domains/cloudflare-email-sending';
import { normalizeHostname } from '../domains/normalize-hostname';
import { adminProcedure } from '../procedures';

function getCloudflareToken(): string {
  const token = env.CF_API_TOKEN?.trim();
  if (!token) {
    throw new CloudflareTokenMissingError();
  }

  return token;
}

function mapCloudflareError(error: unknown): ORPCError<string, unknown> {
  if (error instanceof CloudflareTokenMissingError) {
    return new ORPCError('BAD_REQUEST', {
      message: error.message,
    });
  }

  if (error instanceof CloudflareApiError) {
    if (error.isPermissionError()) {
      return new ORPCError('BAD_REQUEST', {
        message: getCloudflarePermissionHint(),
      });
    }

    return new ORPCError('BAD_GATEWAY', {
      message: error.message,
    });
  }

  throw error;
}

function serializeDomain(row: typeof domains.$inferSelect) {
  return {
    cfSubdomainId: row.cfSubdomainId,
    cfZoneId: row.cfZoneId,
    createdAt: row.createdAt,
    dkimSelector: row.dkimSelector,
    id: row.id,
    name: row.name,
    returnPathDomain: row.returnPathDomain,
    verified: row.verified === 1,
  };
}

export const domainsRouter = {
  create: adminProcedure
    .input(
      z.object({
        cfZoneId: z.string().trim().min(1).optional(),
        name: z.string().trim().min(3).max(255),
      })
    )
    .handler(async ({ context, input }) => {
      try {
        const token = getCloudflareToken();
        const name = normalizeHostname(input.name);

        const [existing] = await context.db
          .select({ id: domains.id })
          .from(domains)
          .where(eq(domains.name, name))
          .limit(1);

        if (existing) {
          throw new ORPCError('CONFLICT', {
            message: `Domain "${name}" is already registered`,
          });
        }

        const zone = await getZoneByHostname(name, token);
        if (!zone) {
          throw new ORPCError('BAD_REQUEST', {
            message: `No active Cloudflare zone found for "${name}". Make sure the root domain is added to your Cloudflare account.`,
          });
        }

        const zoneOverride = input.cfZoneId?.trim();
        if (zoneOverride && zoneOverride !== zone.id) {
          throw new ORPCError('BAD_REQUEST', {
            message: `Zone ID "${zoneOverride}" does not match the zone for "${name}" (${zone.id})`,
          });
        }

        const zoneId = zone.id;
        const cfResult = await provisionSendingSubdomain(zoneId, name, token);
        const id = crypto.randomUUID();
        const now = new Date();

        try {
          await context.db.insert(domains).values({
            cfSubdomainId: cfResult.tag,
            cfZoneId: zoneId,
            createdAt: now,
            dkimSelector: cfResult.dkim_selector ?? null,
            id,
            name,
            returnPathDomain: cfResult.return_path_domain ?? null,
            verified: cfResult.enabled ? 1 : 0,
          });
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            throw new ORPCError('CONFLICT', {
              message: `Domain "${name}" is already registered`,
            });
          }

          throw error;
        }

        const [row] = await context.db
          .select()
          .from(domains)
          .where(eq(domains.id, id))
          .limit(1);

        if (!row) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to create domain',
          });
        }

        return serializeDomain(row);
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }

        throw mapCloudflareError(error);
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const [row] = await context.db
        .select({ id: domains.id })
        .from(domains)
        .where(eq(domains.id, input.id))
        .limit(1);

      if (!row) {
        throw new ORPCError('NOT_FOUND', { message: 'Domain not found' });
      }

      await context.db.delete(domains).where(eq(domains.id, input.id));

      return { ok: true as const };
    }),

  dns: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      try {
        const token = getCloudflareToken();
        const [domain] = await context.db
          .select()
          .from(domains)
          .where(eq(domains.id, input.id))
          .limit(1);

        if (!domain) {
          throw new ORPCError('NOT_FOUND', { message: 'Domain not found' });
        }

        if (!domain.cfSubdomainId) {
          throw new ORPCError('BAD_REQUEST', {
            message: 'Cloudflare subdomain not yet provisioned',
          });
        }

        const records = await getSubdomainDnsRecords(
          domain.cfZoneId,
          domain.cfSubdomainId,
          token
        );

        return records.map((record) => ({
          content: record.content ?? '',
          name: record.name ?? '',
          priority: record.priority ?? null,
          ttl: record.ttl ?? null,
          type: record.type ?? '',
        }));
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }

        throw mapCloudflareError(error);
      }
    }),

  list: adminProcedure.handler(async ({ context }) => {
    const rows = await context.db
      .select()
      .from(domains)
      .orderBy(desc(domains.createdAt));

    return {
      cloudflareConfigured: Boolean(env.CF_API_TOKEN?.trim()),
      domains: rows.map(serializeDomain),
    };
  }),

  verify: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      try {
        const token = getCloudflareToken();
        const [domain] = await context.db
          .select()
          .from(domains)
          .where(eq(domains.id, input.id))
          .limit(1);

        if (!domain) {
          throw new ORPCError('NOT_FOUND', { message: 'Domain not found' });
        }

        if (!domain.cfSubdomainId) {
          throw new ORPCError('BAD_REQUEST', {
            message: 'Cloudflare subdomain not provisioned',
          });
        }

        const cfData = await getSendingSubdomain(
          domain.cfZoneId,
          domain.cfSubdomainId,
          token
        );

        await context.db
          .update(domains)
          .set({
            dkimSelector: cfData.dkim_selector ?? null,
            returnPathDomain: cfData.return_path_domain ?? null,
            verified: cfData.enabled ? 1 : 0,
          })
          .where(eq(domains.id, domain.id));

        const [updated] = await context.db
          .select()
          .from(domains)
          .where(eq(domains.id, domain.id))
          .limit(1);

        if (!updated) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: 'Failed to update domain',
          });
        }

        return {
          domain: serializeDomain(updated),
          verified: cfData.enabled,
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }

        throw mapCloudflareError(error);
      }
    }),
};
