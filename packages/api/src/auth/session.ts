import { env } from "@zerosend/env/server";
import { SignJWT, jwtVerify } from "jose";

import type { Principal } from "./types";

export const SESSION_COOKIE = "zs_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret(): Uint8Array {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ kind: "admin", id: "admin", scopes: ["admin"] })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifyAdminSessionToken(
  token: string
): Promise<Principal | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (payload.kind !== "admin" || payload.id !== "admin") {
      return null;
    }

    return {
      kind: "admin",
      id: "admin",
      scopes: Array.isArray(payload.scopes)
        ? payload.scopes.filter(
            (scope): scope is string => typeof scope === "string"
          )
        : ["admin"],
    };
  } catch {
    return null;
  }
}

export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) {
      return rest.join("=");
    }
  }

  return null;
}

export function createSessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearSessionCookie(secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

export function verifyAdminToken(token: string): boolean {
  return timingSafeEqual(token, env.ADMIN_TOKEN);
}

export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}
