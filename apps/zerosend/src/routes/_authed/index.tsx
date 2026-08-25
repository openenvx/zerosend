import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { EmptyState } from '@zerosend/ui/components/empty-state';
import { Check, ChevronRight, KeyRound, Mail, ScrollText } from 'lucide-react';

import { EmailLogRow } from '@/components/email-log-row';
import { orpc } from '@/utils/orpc';

const LOGS_LIST_LIMIT = 50;

export const Route = createFileRoute('/_authed/')({
  component: HomePage,
});

function HomePage() {
  const keysQuery = useQuery(orpc.keys.list.queryOptions());
  const logsQuery = useQuery(orpc.logs.list.queryOptions());

  const activeKeyCount =
    keysQuery.data?.filter((key) => key.active).length ?? 0;
  const hasKey = activeKeyCount > 0;
  const hasSentEmail = logsQuery.data?.some((log) => log.isTest) ?? false;
  const logs = logsQuery.data ?? [];

  const today = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-body text-muted-foreground">{today}</p>
        <h1 className="text-greeting text-foreground">Welcome back</h1>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,1fr)]">
        <section className="bg-card ring-border rounded-[var(--radius-panel)] p-4 ring-1">
          <h2 className="text-card-title text-foreground mb-4">Get started</h2>
          <div className="space-y-1">
            <SetupRow
              action={null}
              completed
              description="You are signed in with your admin token."
              icon={Check}
              label="Sign in"
            />
            <SetupRow
              action={
                hasKey ? null : (
                  <Link
                    className="text-body text-foreground hover:underline"
                    to="/settings"
                  >
                    Create key
                  </Link>
                )
              }
              completed={hasKey}
              description={
                hasKey
                  ? `${activeKeyCount} active key${activeKeyCount === 1 ? '' : 's'} ready for product apps.`
                  : 'Mint a send key for your other projects.'
              }
              icon={KeyRound}
              label="Create an API key"
            />
            <SetupRow
              action={
                hasSentEmail ? null : (
                  <Link
                    className="text-body text-foreground hover:underline"
                    to="/mailbox"
                  >
                    Send test
                  </Link>
                )
              }
              completed={hasSentEmail}
              description={
                hasSentEmail
                  ? 'Your first test message is stored in the mailbox.'
                  : 'Send a test email from the mailbox or POST /v1/emails.'
              }
              icon={Mail}
              label="Send your first email"
            />
          </div>
        </section>

        <aside className="bg-card ring-border rounded-[var(--radius-panel)] p-4 ring-1">
          <h2 className="text-card-title text-foreground">API keys</h2>
          <p className="text-body text-muted-foreground mt-1">
            Active keys for product integrations
          </p>
          <p className="text-foreground mt-4 text-[24px] font-medium">
            {keysQuery.isPending ? '…' : activeKeyCount}
          </p>
          <Link
            className="border-border bg-background hover:bg-muted mt-4 inline-flex h-8 w-full items-center justify-center rounded-md border px-3 text-sm font-medium"
            to="/settings"
          >
            Manage keys
          </Link>
        </aside>
      </div>

      <section className="bg-card ring-border rounded-[var(--radius-panel)] ring-1">
        <div className="border-border border-b px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ScrollText className="text-muted-foreground size-4" />
              <h2 className="text-card-title text-foreground">Logs</h2>
            </div>
            {logs.length >= LOGS_LIST_LIMIT ? (
              <p className="text-kbd text-muted-foreground">
                Showing latest {LOGS_LIST_LIMIT}
              </p>
            ) : null}
          </div>
        </div>
        {logsQuery.isPending ? (
          <div className="text-body text-muted-foreground p-6">
            Loading logs…
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            description="Send a test from the mailbox with a zs_test_ key, or POST /v1/emails with a zs_live_ key for real delivery."
            icon={ScrollText}
            title="No messages yet"
          />
        ) : (
          <div className="divide-border divide-y">
            {logs.map((log) => (
              <EmailLogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface SetupRowProps {
  label: string;
  description: string;
  icon: typeof Check;
  completed: boolean;
  disabled?: boolean;
  action: React.ReactNode;
}

function SetupRow({
  label,
  description,
  icon: Icon,
  completed,
  disabled = false,
  action,
}: SetupRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-3 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <div
        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
          completed
            ? 'bg-[var(--status-completed)] text-[var(--color-void)]'
            : 'bg-[var(--status-pending)]'
        }`}
      >
        {completed ? <Check className="size-2.5" strokeWidth={3} /> : null}
      </div>
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-body text-foreground">{label}</p>
        <p className="text-kbd text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <div className="text-muted-foreground flex shrink-0 items-center gap-1">
          {action}
          <ChevronRight className="size-4" />
        </div>
      ) : null}
    </div>
  );
}
