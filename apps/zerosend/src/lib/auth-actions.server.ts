import { getRequest } from '@tanstack/react-start/server';
import {
  createAdminSessionToken,
  createSessionCookie,
  clearSessionCookie,
  isSecureRequest,
  verifyAdminToken,
} from '@zerosend/api/auth';

export async function loginWithToken(token: string): Promise<Response> {
  const request = getRequest();

  if (!verifyAdminToken(token)) {
    return Response.json(
      { error: 'Invalid admin token', ok: false as const },
      { status: 401 }
    );
  }

  const sessionToken = await createAdminSessionToken();
  const secure = isSecureRequest(request);

  return Response.json(
    { ok: true as const },
    {
      headers: {
        'Set-Cookie': createSessionCookie(sessionToken, secure),
      },
    }
  );
}

export async function logoutSession(): Promise<Response> {
  const request = getRequest();
  const secure = isSecureRequest(request);

  return Response.json(
    { ok: true as const },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(secure),
      },
    }
  );
}
