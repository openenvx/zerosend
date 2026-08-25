import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@zerosend/ui/components/empty-state";
import { Check, ChevronRight, KeyRound, Mail, ScrollText } from "lucide-react";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authed/")({
  component: HomePage,
});

function HomePage() {
  const keysQuery = useQuery(orpc.keys.list.queryOptions());

  const activeKeyCount =
    keysQuery.data?.filter((key) => key.active).length ?? 0;
  const hasKey = activeKeyCount > 0;

  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-body text-muted-foreground">{today}</p>
        <h1 className="text-greeting text-foreground">Welcome back</h1>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,1fr)]">
        <section className="rounded-[var(--radius-panel)] bg-card p-4 ring-1 ring-border">
          <h2 className="mb-4 text-card-title text-foreground">Get started</h2>
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
                  ? `${activeKeyCount} active key${activeKeyCount === 1 ? "" : "s"} ready for product apps.`
                  : "Mint a send key for your other projects."
              }
              icon={KeyRound}
              label="Create an API key"
            />
            <SetupRow
              action={null}
              completed={false}
              description="Coming in Phase 2 — send from another app and see logs here."
              disabled
              icon={Mail}
              label="Send your first email"
            />
          </div>
        </section>

        <aside className="rounded-[var(--radius-panel)] bg-card p-4 ring-1 ring-border">
          <h2 className="text-card-title text-foreground">API keys</h2>
          <p className="mt-1 text-body text-muted-foreground">
            Active keys for product integrations
          </p>
          <p className="mt-4 text-[24px] font-medium text-foreground">
            {keysQuery.isPending ? "…" : activeKeyCount}
          </p>
          <Link
            className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
            to="/settings"
          >
            Manage keys
          </Link>
        </aside>
      </div>

      <section className="rounded-[var(--radius-panel)] bg-card ring-1 ring-border">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ScrollText className="size-4 text-muted-foreground" />
            <h2 className="text-card-title text-foreground">Logs</h2>
          </div>
        </div>
        <EmptyState
          description="Transactional sends will appear here in Phase 2."
          icon={ScrollText}
          title="No messages yet"
        />
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
        disabled ? "opacity-60" : ""
      }`}
    >
      <div
        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
          completed
            ? "bg-[var(--status-completed)] text-[var(--color-void)]"
            : "bg-[var(--status-pending)]"
        }`}
      >
        {completed ? <Check className="size-2.5" strokeWidth={3} /> : null}
      </div>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-body text-foreground">{label}</p>
        <p className="text-kbd text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
          {action}
          <ChevronRight className="size-4" />
        </div>
      ) : null}
    </div>
  );
}
