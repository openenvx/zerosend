import type { createDb } from '@zerosend/db';

import { findVerifiedDomainForFromAddress } from '../domains/find-domain';
import { UnverifiedFromDomainError } from './errors';

type Db = ReturnType<typeof createDb>;

export async function assertLiveSendDomainAllowed(
  db: Db,
  fromAddress: string
): Promise<void> {
  const domain = await findVerifiedDomainForFromAddress(db, fromAddress);
  if (!domain) {
    throw new UnverifiedFromDomainError();
  }
}
