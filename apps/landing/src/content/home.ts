export const COPY_COMMAND = {
  display: 'curl $ZEROSEND_URL/v1/emails',
  value:
    'curl -sS "$ZEROSEND_URL/v1/emails" -H "Authorization: Bearer $ZEROSEND_API_KEY" -H "Content-Type: application/json" -d \'{"to":"you@company.com","subject":"Hello","text":"Sent from Zerosend"}\'',
} as const;

export const HOME = {
  cta: {
    body: 'Deploy the Worker, mint a key, and send from any app that can make an HTTP request.',
    label: 'Get started',
    title: 'Your next send is one Worker away.',
  },
  faq: {
    body: 'Everything you need before the first deploy. Still stuck?',
    githubLabel: 'Ask on GitHub',
    items: [
      {
        answer:
          'A self-hosted email platform you deploy once on Cloudflare. Other products in your stack call it over HTTP with an API key - the same mental model as Resend, on infrastructure you control.',
        id: 'what',
        question: 'What exactly is Zerosend?',
      },
      {
        answer:
          'Resend is a hosted SaaS. Zerosend is a Worker you run on your Cloudflare account: operator dashboard, /v1 REST, and logs in one deploy. You keep the keys. You pay Cloudflare, not a per-seat email bill.',
        id: 'vs-resend',
        question: 'How is it different from Resend?',
      },
      {
        answer:
          'Two lanes, no user table. You sign into the dashboard with an ADMIN_TOKEN. Product apps authenticate with Bearer API keys, hashed in D1. Keys never live in the browser.',
        id: 'auth',
        question: 'How does auth actually work?',
      },
      {
        answer:
          'Anywhere a Cloudflare Worker runs. One-click deploy from GitHub, or wrangler from your machine. There is no required control plane and no hosted lock-in.',
        id: 'hosting',
        question: 'Where can I deploy it?',
      },
      {
        answer:
          'Yes. Point ZEROSEND_URL and ZEROSEND_API_KEY at the instance, then POST /v1/emails. Your other Workers and servers stay as they are - Zerosend is a service they call, not a library they embed.',
        id: 'existing-app',
        question: 'Can I add it to an existing app?',
      },
      {
        answer:
          'Zerosend is open source. You pay for the Cloudflare resources you run it on, and for Cloudflare Email Sending. There is no Zerosend subscription.',
        id: 'cost',
        question: 'What does it cost?',
      },
    ],
    label: 'FAQ',
    title: 'Questions, answered.',
  },
  features: {
    body: 'Send transactional email today, then build on the same foundation with visual templates and event-driven automations. One self-hosted Cloudflare app for your products, keys, domains, and delivery logs.',
    items: [
      {
        body: 'Dashboard and /v1 REST share a single Cloudflare Worker. One deploy, one wrangler file, and a foundation ready for background delivery.',
        id: 'worker',
        title: 'One Worker',
      },
      {
        body: 'POST /v1/emails with from, to, subject, and html or text. Bearer API keys. The same shape your team already knows.',
        id: 'api',
        title: 'Resend-shaped API',
      },
      {
        body: 'Mint zs_test_ and zs_live_ keys in the dashboard. Hashed in D1, scoped to send. Nothing is locked to a vendor account.',
        id: 'keys',
        title: 'Keys you control',
      },
      {
        body: 'Sign in with an admin token. No user table, no members, no multi-tenant SaaS. You operate it.',
        id: 'dashboard',
        title: 'Operator dashboard',
      },
      {
        body: 'Every send is stored: subject, addresses, status, Cloudflare message id. Test sends land in the mailbox first.',
        id: 'logs',
        title: 'Logs you can read',
      },
      {
        body: 'Coming next: design reusable email templates in OpenEnvX, publish them, and send with variables from any product.',
        id: 'templates',
        title: 'Reusable templates',
      },
      {
        body: 'Coming next: trigger emails from product events, then add delays and event waits as workflows evolve.',
        id: 'automations',
        title: 'Event-driven automations',
      },
      {
        body: 'Clone, set ADMIN_TOKEN and SESSION_SECRET, migrate D1, deploy. Sensible defaults - no control plane to rent.',
        id: 'deploy',
        title: 'Self-host on Cloudflare',
      },
    ],
    label: 'Why Zerosend',
    title: 'From first send to automated delivery.',
  },
  agentSkill: {
    description:
      'Beyond API docs, the Zerosend Agent Skill teaches coding agents how to authenticate, test sends safely, scope projects, retry requests, and deploy-so they write correct integrations instead of guessing.',
    file: 'skills/zerosend/SKILL.md',
    installCommand: 'npx skills add openenvx/zerosend',
    label: 'Agent skill',
    points: [
      'Install with npx skills add openenvx/zerosend',
      'Works with coding agents that support the open Agent Skills format',
      'Tests first; live delivery requires explicit approval',
      'Read the source on GitHub before installing',
    ],
    preview: [
      'Separate admin and API-key auth',
      'Test keys stay in the mailbox',
      'Idempotency keys make retries safe',
      'Project-scoped keys and verified domains',
    ],
    titleLead: 'A skill your agent loads to use Zerosend correctly.',
    href: 'https://github.com/openenvx/zerosend/tree/main/skills/zerosend',
    linkLabel: 'Browse the agent skill',
  },
  hero: {
    headline: 'Send email from your stack without another SaaS bill.',
    mediaCaption:
      'Operator dashboard, /v1 REST, and delivery logs - one Worker you host on Cloudflare.',
    pill: 'One Worker on Cloudflare',
    support: {
      after: '.',
      before: 'Zerosend is a ',
      emphasisA: 'self-hosted email platform',
      emphasisB: 'API keys you control',
      middle:
        ' for your Cloudflare stack. Send email today, then add reusable templates and event-driven automations as your products grow-with ',
    },
    tertiaryHref: '/docs/getting-started',
  },
  pipeline: {
    body: 'Authenticate with a send key, hand the message to Cloudflare Email Sending, and keep a readable log. Test keys store the send. Live keys deliver it.',
    label: 'Delivery',
    points: [
      {
        body: 'Bearer API keys are hashed in D1 and scoped to send. The dashboard never sees the secret twice.',
        title: 'Auth on every request',
      },
      {
        body: 'Live keys go through env.EMAIL. Test keys write to the mailbox so you can inspect the message without sending.',
        title: 'Test or deliver',
      },
      {
        body: 'Subject, from, to, status, and Cloudflare message id stay in logs. Failures keep the error next to the row.',
        title: 'A log you can audit',
      },
    ],
    steps: [
      { detail: 'Authorization: Bearer zs_live_…', title: 'API key' },
      { detail: 'POST /v1/emails', title: 'Send request' },
      { detail: 'env.EMAIL on this account', title: 'Cloudflare Email' },
      { detail: 'id, status, addresses', title: 'Logged' },
    ],
    title: 'A send is a request. The rest is infrastructure.',
  },
  playground: {
    body: 'One POST is a working send. Plain HTTP, OpenAPI-backed endpoints, copyable curl, and an llms.txt index make the API easy to use from your app, scripts, or coding agents.',
    files: [
      {
        hint: 'A Bearer key and a JSON body are a complete send. Point ZEROSEND_URL at your Worker.',
        id: 'curl',
        label: 'curl',
        lines: [
          { text: 'curl -sS "$ZEROSEND_URL/v1/emails" \\', tone: 'muted' },
          {
            text: '  -H "Authorization: Bearer $ZEROSEND_API_KEY" \\',
            tone: 'code',
          },
          { text: '  -H "Content-Type: application/json" \\', tone: 'code' },
          { text: "  -d '{", tone: 'code' },
          { text: '    "to": "you@company.com",', tone: 'value' },
          { text: '    "subject": "Hello from Zerosend",', tone: 'value' },
          { text: '    "text": "Sent from your Worker."', tone: 'value' },
          { text: "  }'", tone: 'code' },
        ],
        name: 'send.sh',
        optional: false,
      },
      {
        hint: 'Call it from any runtime that can fetch. No SDK required.',
        id: 'ts',
        label: 'TypeScript',
        lines: [
          { text: `await fetch(\${ZEROSEND_URL}/v1/emails\`, {`, tone: 'code' },
          { text: '  method: "POST",', tone: 'code' },
          { text: '  headers: {', tone: 'code' },
          {
            text: `    Authorization: \`Bearer \${ZEROSEND_API_KEY}\`,`,
            tone: 'value',
          },
          { text: '    "Content-Type": "application/json",', tone: 'code' },
          { text: '  },', tone: 'code' },
          { text: '  body: JSON.stringify({', tone: 'code' },
          { text: '    to: "ops@acme.dev",', tone: 'value' },
          { text: '    subject: "Invoice ready",', tone: 'value' },
          {
            text: '    html: "<p>Your invoice is attached.</p>",',
            tone: 'value',
          },
          { text: '  }),', tone: 'code' },
          { text: '});', tone: 'code' },
        ],
        name: 'send.ts',
        optional: false,
      },
      {
        hint: 'zs_test_ keys authenticate and store the message. zs_live_ keys send through Cloudflare Email.',
        id: 'env',
        label: 'Env',
        lines: [
          { text: 'ZEROSEND_URL=https://mail.example.com', tone: 'code' },
          { text: 'ZEROSEND_API_KEY=zs_live_…', tone: 'value' },
        ],
        name: '.env',
        optional: true,
      },
    ],
    label: 'The API',
    title: 'A send is a POST.',
  },
} as const;
