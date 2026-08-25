const API_KEY_PREFIX = "zs_live_";

export function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const secret = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `${API_KEY_PREFIX}${secret}`;
}

export function getApiKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, API_KEY_PREFIX.length + 8);
}

export async function hashApiKey(rawKey: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rawKey)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
