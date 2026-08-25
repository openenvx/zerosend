# zerosend

Self-hosted email platform on Cloudflare Workers — dashboard, REST API, and D1. Deploy with **Wrangler** or the **Deploy to Cloudflare** button.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/openenvx/zerosend)

**Full deploy guide:** [DEPLOY.md](./DEPLOY.md)

## Quick start (local)

Same flow as [Mailflare](https://github.com/hieunc229/mailflare):

```bash
bun install
cp apps/zerosend/.dev.vars.example apps/zerosend/.dev.vars
# Set ADMIN_TOKEN and SESSION_SECRET in .dev.vars

bun run db:migrate:local
bun run dev
```

Or use the setup helper (copies `.dev.vars.example` if missing):

```bash
bun run setup && bun run migrate && bun run dev
```

- **Product:** http://localhost:3001 (`bun run dev`)
- **Landing + docs:** http://localhost:3000 (`bun run dev:landing` or `bun run dev:all`)

Sign in at `/login` with your `ADMIN_TOKEN`, then create API keys in **Settings**.

## Quick start (Cloudflare)

### One-click (recommended)

1. Click **Deploy to Cloudflare** above (repo must be public on GitHub).
2. Connect GitHub and enter `ADMIN_TOKEN` + `SESSION_SECRET` when prompted.
3. Cloudflare provisions D1, runs migrations, builds, and deploys the Worker.

Replace `openenvx/zerosend` in the button URL with your fork if you self-host the template.

### Manual (Wrangler)

```bash
bunx wrangler login
bun run deploy:with-migrations
cd apps/zerosend && bunx wrangler secret put ADMIN_TOKEN && bunx wrangler secret put SESSION_SECRET
```

See [DEPLOY.md](./DEPLOY.md) for custom domains, landing deploy, and troubleshooting.

## Features

- **TypeScript** — type-safe app and API
- **TanStack Start** — SSR on Cloudflare Workers
- **oRPC** — typed dashboard API
- **Drizzle + D1** — SQLite at the edge
- **Wrangler** — standard Cloudflare deploy path for external users

## Project structure

```
zerosend/
├── wrangler.jsonc   # Deploy button binding config (D1)
├── apps/
│   ├── landing/     # Marketing + Fumadocs (/docs)
│   └── zerosend/    # Product Worker (dashboard + /v1 + D1)
├── packages/
│   ├── api/         # Auth, oRPC routers
│   ├── db/          # Schema + migrations
│   └── ui/          # Shared components
└── DEPLOY.md        # Step-by-step Cloudflare deploy
```

## Environment (zerosend Worker)

| Variable         | Where                        | Purpose                  |
| ---------------- | ---------------------------- | ------------------------ |
| `ADMIN_TOKEN`    | `.dev.vars` / deploy secrets | Operator dashboard login |
| `SESSION_SECRET` | `.dev.vars` / deploy secrets | JWT cookie signing       |
| `DB`             | wrangler D1 binding          | API keys + settings      |

## Product integration

```bash
export ZEROSEND_URL=https://your-worker.workers.dev
export ZEROSEND_API_KEY=zs_live_…

curl -sS "$ZEROSEND_URL/v1/me" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY"
```

## Scripts

| Command | Description |
| --- | --- |
| `bun run setup` | Copy `.dev.vars.example` → `.dev.vars` (if missing) |
| `bun run dev` | Local product Worker (:3001) |
| `bun run dev:landing` | Local landing + docs (:3000) |
| `bun run dev:all` | Product + landing in parallel |
| `bun run migrate` | Apply D1 migrations locally (alias) |
| `bun run db:migrate:local` | Apply D1 migrations to local D1 |
| `bun run db:migrate:remote` | Apply D1 migrations to production D1 |
| `bun run db:generate` | New Drizzle migration after schema edits |
| `bun run deploy` | Build + migrate + deploy product Worker |
| `bun run deploy:with-migrations` | Remote migrate + deploy |
| `bun run deploy:landing` | Deploy landing Worker |
| `bun run cf-typegen` | Regenerate Wrangler env types |
| `bun run check` | Lint/format (Ultracite) |
