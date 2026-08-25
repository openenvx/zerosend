import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getSessionCookie, verifyAdminSessionToken } from "@zerosend/api/auth";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    const token = getSessionCookie(request);
    if (!token) {
      return { authenticated: false as const };
    }

    const principal = await verifyAdminSessionToken(token);
    if (!principal) {
      return { authenticated: false as const };
    }

    return {
      authenticated: true as const,
      principal,
    };
  }
);
