import { describe, expect, it, vi } from "vitest";

vi.mock("@zerosend/env/server", () => ({
  env: {
    ADMIN_TOKEN: "test-admin-token",
    SESSION_SECRET: "test-session-secret-with-enough-length",
  },
}));

import { generateApiKey, getApiKeyPrefix, hashApiKey } from "./api-key-crypto";
import {
  createAdminSessionToken,
  timingSafeEqual,
  verifyAdminSessionToken,
} from "./session";

describe("api key crypto", () => {
  it("generates keys with zs_live_ prefix", () => {
    const key = generateApiKey();
    expect(key.startsWith("zs_live_")).toBe(true);
    expect(getApiKeyPrefix(key)).toBe(key.slice(0, "zs_live_".length + 8));
  });

  it("hashes keys deterministically", async () => {
    const key = "zs_live_testkey1234567890abcdef";
    const hashA = await hashApiKey(key);
    const hashB = await hashApiKey(key);
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });
});

describe("session", () => {
  it("round-trips admin session tokens", async () => {
    const token = await createAdminSessionToken();
    const principal = await verifyAdminSessionToken(token);

    expect(principal).toEqual({
      kind: "admin",
      id: "admin",
      scopes: ["admin"],
    });
  });
});

describe("timingSafeEqual", () => {
  it("compares strings safely", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
  });
});
