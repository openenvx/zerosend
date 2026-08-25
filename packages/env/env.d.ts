/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Env {
    DB: D1Database;
    EMAIL: SendEmail;
    RATE_LIMIT_KV: KVNamespace;
    ADMIN_TOKEN: string;
    SESSION_SECRET: string;
  }
}

declare module 'cloudflare:workers' {
  namespace Cloudflare {
    export interface Env extends globalThis.Env {}
  }
}

export type CloudflareEnv = Env;
