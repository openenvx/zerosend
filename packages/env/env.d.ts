/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Env {
    DB: D1Database;
    EMAIL: SendEmail;
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
