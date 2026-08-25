import { Check, KeyRound, Mail } from 'lucide-react';

function SetupRow({
  completed,
  description,
  label,
}: {
  completed: boolean;
  description: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <span
        className={`grid size-4 shrink-0 place-items-center rounded-full ${
          completed
            ? 'bg-electric-blue text-ink-black'
            : 'bg-marketing-surface-faded-bolder'
        }`}
      >
        {completed ? (
          <Check aria-hidden className="size-2.5" strokeWidth={3} />
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-paper-white truncate text-[13px]">{label}</p>
        <p className="text-marketing-subtlest truncate font-mono text-[10px]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DashboardSurface() {
  return (
    <div className="bg-marketing-surface-base flex h-full flex-col gap-3 p-3 sm:p-4">
      <div>
        <p className="f-body-sm text-marketing-subtler">Tuesday, August 25</p>
        <p className="f-display-md text-paper-white mt-1">Welcome back</p>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(180px,1fr)]">
        <section className="border-marketing-divider bg-marketing-surface-raised rounded-lg border p-3">
          <p className="f-heading-sm text-paper-white px-2">Get started</p>
          <div className="mt-1">
            <SetupRow
              completed
              description="Signed in with ADMIN_TOKEN"
              label="Sign in"
            />
            <SetupRow
              completed
              description="2 active keys for product apps"
              label="Create an API key"
            />
            <SetupRow
              completed={false}
              description="POST /v1/emails or send from the mailbox"
              label="Send your first email"
            />
          </div>
        </section>
        <aside className="border-marketing-divider bg-marketing-surface-raised rounded-lg border p-4">
          <p className="f-heading-sm text-paper-white">API keys</p>
          <p className="text-marketing-subtlest mt-1 font-mono text-[10px]">
            Active keys for product integrations
          </p>
          <p className="text-paper-white mt-4 text-3xl font-medium tabular-nums">
            2
          </p>
          <div className="border-marketing-divider bg-marketing-surface-base mt-4 flex items-center gap-2 rounded-md border px-3 py-2">
            <KeyRound
              aria-hidden
              className="text-marketing-subtlest size-3.5"
            />
            <span className="text-marketing-subtle font-mono text-[11px]">
              zs_live_7f3a…
            </span>
          </div>
        </aside>
      </div>
      <div className="border-marketing-divider bg-marketing-surface-raised hidden items-center gap-2 rounded-lg border px-4 py-3 sm:flex">
        <Mail aria-hidden className="text-marketing-subtlest size-3.5" />
        <span className="text-paper-white truncate text-[13px]">
          Invoice ready
        </span>
        <span className="text-marketing-subtlest font-mono text-[10px]">
          billing@acme.dev → ops@acme.dev
        </span>
        <span className="text-electric-blue ml-auto font-mono text-[10px]">
          sent
        </span>
      </div>
    </div>
  );
}
