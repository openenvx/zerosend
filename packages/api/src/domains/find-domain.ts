import type { createDb } from '@zerosend/db';
import { domains } from '@zerosend/db/schema';
import { eq } from 'drizzle-orm';

import { parseEmailHost } from './normalize-hostname';

type Db = ReturnType<typeof createDb>;

export async function findDomainByHostname(db: Db, hostname: string) {
  const [row] = await db
    .select()
    .from(domains)
    .where(eq(domains.name, hostname))
    .limit(1);

  return row ?? null;
}

export async function findVerifiedDomainForFromAddress(
  db: Db,
  fromAddress: string
) {
  const host = parseEmailHost(fromAddress);
  if (!host) {
    return null;
  }

  const domain = await findDomainByHostname(db, host);
  if (!domain || domain.verified !== 1) {
    return null;
  }

  return domain;
}

export async function isVerifiedDefaultFromHost(db: Db, fromAddress: string) {
  return findVerifiedDomainForFromAddress(db, fromAddress) !== null;
}
