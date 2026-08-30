/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Env {
    CF_API_TOKEN?: string;
    DB: D1Database;
    EMAIL: SendEmail;
    RATE_LIMIT_KV: KVNamespace;
    ADMIN_TOKEN: string;
    CRON_SECRET?: string;
    SESSION_SECRET: string;
  }
}

declare module 'cloudflare:workers' {
  namespace Cloudflare {
    export interface Env extends globalThis.Env {}
  }
}

export type CloudflareEnv = Env;
