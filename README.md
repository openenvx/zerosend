# zerosend

Self-hosted email platform on Cloudflare Workers - dashboard, REST API, and D1. Deploy with **Wrangler** or the **Deploy to Cloudflare** button.

![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)

**Full deploy guide:** [DEPLOY.md](./DEPLOY.md)

## Development

### Run locally

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

- **Product:** [http://localhost:3001](http://localhost:3001) (`bun run dev`)
- **Landing + docs:** [http://localhost:3000](http://localhost:3000) (`bun run dev:landing` or `bun run dev:all`)

Sign in at `/login` with your `ADMIN_TOKEN`, then create API keys in **Settings**. Use the sidebar project switcher to namespace keys, logs, mailbox, and templates per product. **Domains** and the default from address stay instance-wide.

## Usage

### Deploy to Cloudflare

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

- **TypeScript** - type-safe app and API
- **TanStack Start** - SSR on Cloudflare Workers
- **oRPC** - typed dashboard API
- **Drizzle + D1** - SQLite at the edge
- **Wrangler** - standard Cloudflare deploy path for external users

## Roadmap

- [x] One-click deployment to Cloudflare
- [x] Dashboard, REST API, API keys, and test mailbox
- [x] Sending domain onboarding and live email delivery
- [x] Project-scoped templates and event-driven automations
- [ ] Guided post-deploy onboarding
- [ ] Versioned upgrades with automatic migration support
- [ ] `npx zerosend deploy` installer and upgrade CLI
- [ ] Docker/VPS deployment
- [ ] Pluggable email delivery providers

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

| Variable | Where | Purpose |
| --- | --- | --- |
| `ADMIN_TOKEN` | `.dev.vars` / deploy secrets | Operator dashboard login |
| `SESSION_SECRET` | `.dev.vars` / deploy secrets | JWT cookie signing |
| `CF_API_TOKEN` | `.dev.vars` / deploy secrets (optional) | Onboard domains in dashboard; not needed for `zs_test_` sends |
| `DB` | wrangler D1 binding | API keys, settings, email logs |
| `EMAIL` | wrangler `send_email` binding | Cloudflare Email Sending for `zs_live_` keys |

## Product integration

```bash
export ZEROSEND_URL=https://your-worker.workers.dev
export ZEROSEND_API_KEY=zs_test_…

# Verify the key
curl -sS "$ZEROSEND_URL/v1/me" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY"

# Send a test email (stored in /mailbox - no outbound delivery)
curl -sS "$ZEROSEND_URL/v1/emails" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@example.com",
    "to": ["user@example.com", "other@example.com"],
    "fromName": "Zerosend",
    "replyTo": "support@example.com",
    "subject": "Hello from Zerosend",
    "html": "<p>It works.</p>"
  }'
```

Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (unix seconds). Repeat a send safely with `Idempotency-Key: your-key-here` - the same body returns the stored result.

Sign in to the dashboard and open **Mailbox** to preview test sends. Use a `zs_live_` key for real delivery once your sending domain is onboarded to Cloudflare Email Sending.

### Live send (`zs_live_`)

1. Open **Domains** in the dashboard and add a sending domain on this Cloudflare account (`CF_API_TOKEN` required). Copy DNS records, then **Verify**.
2. Set **Settings → Default from address** to an address on that verified domain (used when `from` is omitted).
3. Create a **live** API key per zerosend project (sidebar switcher) and send:

```bash
export ZEROSEND_API_KEY=zs_live_…

curl -sS "$ZEROSEND_URL/v1/emails" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "you@example.com",
    "subject": "Hello from Zerosend",
    "html": "<p>Live delivery.</p>"
  }'
```

Local `wrangler dev` simulates the `EMAIL` binding by default. Add `"remote": true` to the `send_email` binding in `apps/zerosend/wrangler.jsonc` when you want real sends from your laptop.

### Templates

Design templates in the dashboard under **Templates** (OpenEnvx visual editor via `@openenvx/email-studio`). **Publish** stores HTML/text snapshots. Send from another project with the template id for the current zerosend project:

```bash
curl -sS "$ZEROSEND_URL/v1/emails" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@example.com",
    "to": "user@example.com",
    "subject": "Welcome {{{name}}}",
    "template": {
      "id": "00000000-0000-4000-8000-000000000010",
      "variables": { "name": "Ada" }
    }
  }'
```

Use `zs_test_` keys to preview in **Mailbox** before live delivery. Subject and published snapshots support `{{{variable}}}` tokens; zerosend interpolates them at send time.

## Development scripts

| Command | Description |
| --- | --- |
| `bun run setup` | Copy `.dev.vars.example` → `.dev.vars` (if missing) |
| `bun run dev` | Local product Worker (:3001) |
| `bun run dev:landing` | Local landing + docs (:3000) |
| `bun run dev:all` | Product + landing in parallel |
| `bun run migrate` | Apply D1 migrations locally (alias) |
| `bun run db:migrate:local` | Apply D1 migrations to local D1 |
| `bun run db:generate` | New Drizzle migration after schema edits |
| `bun run cf-typegen` | Regenerate Wrangler env types |
| `bun run check` | Lint/format (Ultracite) |
| `bun run fix` | Format and fix lint issues (Ultracite) |

## Usage scripts

| Command                          | Description                           |
| -------------------------------- | ------------------------------------- |
| `bun run deploy`                 | Build + deploy + remote D1 migrations |
| `bun run deploy:with-migrations` | Same as `deploy`                      |
| `bun run deploy:landing`         | Deploy landing Worker                 |
| `bun run db:migrate:remote`      | Apply D1 migrations to production D1  |
