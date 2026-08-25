import { getRequest } from "@tanstack/react-start/server";
import {
  createAdminSessionToken,
  createSessionCookie,
  clearSessionCookie,
  isSecureRequest,
  verifyAdminToken,
} from "@zerosend/api/auth";

export async function loginWithToken(token: string): Promise<Response> {
  const request = getRequest();

  if (!verifyAdminToken(token)) {
    return Response.json(
      { ok: false as const, error: "Invalid admin token" },
      { status: 401 }
    );
  }

  const sessionToken = await createAdminSessionToken();
  const secure = isSecureRequest(request);

  return Response.json(
    { ok: true as const },
    {
      headers: {
        "Set-Cookie": createSessionCookie(sessionToken, secure),
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
        "Set-Cookie": clearSessionCookie(secure),
      },
    }
  );
}
