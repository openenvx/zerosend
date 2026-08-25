import { getSessionCookie, verifyAdminSessionToken } from './session';
import type { AuthAdapter, Principal } from './types';

export class AdminTokenAdapter implements AuthAdapter {
  async authenticate(request: Request): Promise<Principal | null> {
    const token = getSessionCookie(request);
    if (!token) {
      return null;
    }

    return verifyAdminSessionToken(token);
  }
}
