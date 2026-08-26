import { createDb } from '@zerosend/db';

import { loadProjectSessionContext } from '../projects/session';
import { getSessionCookie, verifyAdminSessionToken } from './session';

export async function loadAdminSession(request: Request) {
  const token = getSessionCookie(request);
  if (!token) {
    return { authenticated: false as const };
  }

  const principal = await verifyAdminSessionToken(token);
  if (!principal) {
    return { authenticated: false as const };
  }

  const db = createDb();
  const projectContext = await loadProjectSessionContext(db);

  if (!projectContext) {
    return { authenticated: false as const };
  }

  return {
    authenticated: true as const,
    currentProject: projectContext.currentProject,
    principal,
    projects: projectContext.projects,
  };
}
