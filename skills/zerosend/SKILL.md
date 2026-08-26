---
name: zerosend
description: Integrate applications with a self-hosted Zerosend email instance safely.
---

# Zerosend

Use this skill when an application needs to send transactional email through a Zerosend instance. Zerosend is a self-hosted email service for Cloudflare Workers. Applications call it over HTTP with a Bearer API key; they do not import Zerosend into their own Worker.

## Before you write code

1. Read the instance's `/llms.txt` and the relevant pages in `/docs`.
2. Ask for `ZEROSEND_URL` and `ZEROSEND_API_KEY` if they are not already configured.
3. Use a `zs_test_` key first. Test sends are stored in the Zerosend mailbox and are not delivered.
4. Use a `zs_live_` key only after the user explicitly approves real delivery.

## Current API

Verify the key:

```bash
curl -sS "$ZEROSEND_URL/v1/me" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY"
```

Send an email:

```bash
curl -sS "$ZEROSEND_URL/v1/emails" \
  -H "Authorization: Bearer $ZEROSEND_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: invoice-123" \
  -d '{
    "to": ["person@example.com"],
    "subject": "Invoice ready",
    "html": "<p>Your invoice is ready.</p>"
  }'
```

The request supports `from`, `to` (one address or an array), `fromName`, `replyTo`, `subject`, and `html` or `text`. If `from` is omitted, the instance default is used. Live sends require a verified sending domain on the instance's Cloudflare account.

## Integration rules

- Keep `ZEROSEND_API_KEY` server-side. Never put it in browser code or commit it to a repository.
- Prefer `zs_test_` during development and automated checks.
- Add an `Idempotency-Key` when a retry could send the same message twice.
- Handle non-2xx responses and preserve the response `id` for logging.
- Do not silently switch from a test key to a live key.
- Keep the existing application's auth and runtime. Zerosend is an HTTP service, not a dependency to embed.

## Projects and domains

API keys belong to a Zerosend project. Use the key for the project that owns the sending integration. Projects namespace application resources on one Zerosend instance; they do not replace a separate deployment for a different Cloudflare account. Sending domains are managed at the instance level.

## Roadmap awareness

Visual templates and event-driven automations are planned capabilities. Do not invent template or automation endpoints when they are not present in the instance's API documentation. Use `/v1/emails` with rendered `html` or `text` until those endpoints are available.
