# Deploy Zerosend to Cloudflare

Self-host zerosend on your Cloudflare account with **Wrangler** or the official **Deploy to Cloudflare** button.

You deploy **two Workers** (same repo):

| Worker             | App             | Purpose                     |
| ------------------ | --------------- | --------------------------- |
| `zerosend`         | `apps/zerosend` | Dashboard + `/v1` API + D1  |
| `zerosend-landing` | `apps/landing`  | Marketing + docs (optional) |

Most integrations only need the **zerosend** Worker URL.

## One-click deploy (Deploy to Cloudflare button)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/openenvx/zerosend)

1. Fork or use the public [openenvx/zerosend](https://github.com/openenvx/zerosend) repository.
2. Click the button above (or add the same snippet to your fork’s README with your `owner/repo` path).
3. Connect GitHub/GitLab and authorize Cloudflare Workers Builds.
4. Enter secrets when prompted (from [`.dev.vars.example`](./.dev.vars.example)):

   | Secret           | Purpose                                     |
   | ---------------- | ------------------------------------------- |
   | `ADMIN_TOKEN`    | Dashboard login at `/login`                 |
   | `SESSION_SECRET` | JWT cookie signing (`openssl rand -hex 32`) |

5. Cloudflare reads [`wrangler.jsonc`](./wrangler.jsonc), **auto-provisions D1**, runs the root `build` + `deploy` scripts (including D1 migrations), and deploys the Worker.

**Do not commit** `.dev.vars` or account-specific D1 `database_id` values. The template omits `database_id` so each account gets its own database.

After the first successful deploy, your Worker URL is shown in the Cloudflare dashboard (e.g. `https://zerosend.<subdomain>.workers.dev`).

### Running remote migrations later

If you need to apply migrations outside the deploy script (e.g. after pulling schema changes):

```bash
bun run db:migrate:remote
```

If migration commands fail with “database not found”, copy the D1 database ID from **Workers & Pages → zerosend → Settings → Bindings → DB** into `apps/zerosend/wrangler.jsonc` **locally only** — do not commit account-specific IDs to a public template.

## Prerequisites (manual deploy)

- [Bun](https://bun.sh) (or npm/pnpm)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) v4 (`bunx wrangler --version`)

## 1. Clone and install

```bash
git clone https://github.com/openenvx/zerosend.git
cd zerosend
bun install
```

## 2. Local development (no remote Cloudflare resources)

```bash
cp apps/zerosend/.dev.vars.example apps/zerosend/.dev.vars
# Edit ADMIN_TOKEN and SESSION_SECRET

bun run migrate
bun run dev
```

Open http://localhost:3001 — sign in with `ADMIN_TOKEN`.

Landing + docs (optional): `bun run dev:landing` → http://localhost:3000

Local D1 lives under `apps/zerosend/.wrangler/`. Secrets load from `.dev.vars`.

## 3. Manual production deploy (zerosend)

Use this path if you are not using the Deploy button.

### 3a. Log in

```bash
bunx wrangler login
```

### 3b. Deploy (D1 auto-provisioned on first deploy)

From repo root:

```bash
bun run deploy:zerosend
```

On first deploy, Wrangler creates the `zerosend` D1 database from `wrangler.jsonc` (no pre-created `database_id` required).

### 3c. Set secrets (if not already set)

```bash
cd apps/zerosend
bunx wrangler secret put ADMIN_TOKEN
bunx wrangler secret put SESSION_SECRET
```

Use a long random admin password and `openssl rand -hex 32` for the session secret.

### 3d. Verify

Wrangler prints your Worker URL (e.g. `https://zerosend.<subdomain>.workers.dev`). That is your `ZEROSEND_URL`.

```bash
curl -sS "$ZEROSEND_URL/v1/me" -H "Authorization: Bearer zs_live_…"
```

Create API keys in the dashboard **Settings** page after signing in at `$ZEROSEND_URL/login`.

## 4. Deploy landing (optional)

[![Deploy landing](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/openenvx/zerosend&path=apps/landing)

Or manually:

```bash
bun run deploy:landing
```

**Note:** The landing Worker has no D1 binding and can use the subdirectory deploy button. The product Worker should use the **root** deploy button so workspace packages resolve during `bun install`.

Point your marketing domain at the `zerosend-landing` Worker in the Cloudflare dashboard, or use the `*.workers.dev` URL.

## 5. Custom domains

In Cloudflare Dashboard → Workers & Pages → your Worker → **Settings → Domains & Routes**, add:

- `zerosend.yourdomain.com` → `zerosend` Worker
- `zerosend.com` or `docs.zerosend.com` → `zerosend-landing` Worker (optional)

Set `ZEROSEND_URL=https://zerosend.yourdomain.com` in product apps that send mail.

## Scripts reference

| Command | Description |
| --- | --- |
| `bun run setup` | Copy `.dev.vars.example` if missing |
| `bun run dev` | Local zerosend Worker (:3001) |
| `bun run dev:landing` | Local landing + docs (:3000) |
| `bun run dev:all` | Product + landing in parallel |
| `bun run migrate` | Local D1 migrations (shorthand) |
| `bun run build` | Build zerosend (Workers Builds / CI) |
| `bun run deploy` | Build + migrate + deploy zerosend (Deploy button default) |
| `bun run deploy:with-migrations` | Remote migrate + deploy |
| `bun run deploy:zerosend` | Same as `deploy` |
| `bun run deploy:landing` | Build + deploy landing Worker |
| `bun run db:generate` | Generate Drizzle migrations after schema changes |
| `bun run db:migrate:local` | Apply migrations to local D1 |
| `bun run db:migrate:remote` | Apply migrations to production D1 |
| `bun run cf-typegen` | Regenerate Wrangler env types |

## Troubleshooting

**`env.DB` / D1 errors locally** — run `bun run db:migrate:local` from the repo root.

**401 on `/v1/me`** — use a live `zs_live_…` key from Settings, not the admin token.

**D1 error 7404: database could not be found** — remove any committed `database_id` from `wrangler.jsonc`. D1 IDs are account-specific; the template uses `database_name` only so Cloudflare can provision per account.

**Deploy button build fails on monorepo** — use the root deploy URL (no `path=`). The product Worker needs the full repo so `@zerosend/*` workspace packages install correctly.

**Schema changes** — `bun run db:generate`, commit the new SQL under `packages/db/src/migrations`, then redeploy or `bun run db:migrate:remote`.
