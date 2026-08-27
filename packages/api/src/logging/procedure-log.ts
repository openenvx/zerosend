import type { AuditableLogger } from 'evlog';

import type { ApiKeyPrincipal, Principal } from '../auth/types';

export function setPrincipalLogFields(
  log: AuditableLogger,
  principal: Principal | null
): void {
  if (!principal) {
    return;
  }

  if (principal.kind === 'admin') {
    log.set({ auth: { kind: 'admin' } });
    return;
  }

  if (principal.kind === 'api_key') {
    log.set({
      apiKey: {
        id: principal.id,
        keyType: principal.keyType,
        projectId: principal.projectId,
      },
    });
    return;
  }

  log.set({ auth: { kind: principal.kind, id: principal.id } });
}

export function setApiKeyLogFields(
  log: AuditableLogger,
  principal: ApiKeyPrincipal
): void {
  log.set({
    apiKey: {
      id: principal.id,
      keyType: principal.keyType,
      projectId: principal.projectId,
    },
  });
}
