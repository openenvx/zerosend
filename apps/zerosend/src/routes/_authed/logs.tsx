import { useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { Button } from '@zerosend/ui/components/button';
import { EmptyState } from '@zerosend/ui/components/empty-state';
import { PageHeader } from '@zerosend/ui/components/page-header';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import { PauseIcon, PlayIcon, ScrollText } from 'lucide-react';
import { useState } from 'react';

import { LogDetailSheet } from '@/components/logs/log-detail-sheet';
import { LogsTable } from '@/components/logs/logs-table';
import { orpc } from '@/utils/orpc';

const LOGS_LIST_LIMIT = 50;
const LOGS_REFETCH_INTERVAL_MS = 5000;
const authedRoute = getRouteApi('/_authed');

export const Route = createFileRoute('/_authed/logs')({
  component: LogsPage,
});

function LogsPage() {
  const { currentProject } = authedRoute.useLoaderData();
  const projectId = currentProject.id;
  const [paused, setPaused] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const logsQuery = useQuery({
    ...orpc.logs.list.queryOptions({ input: { projectId } }),
    refetchInterval: paused ? false : LOGS_REFETCH_INTERVAL_MS,
  });
  const detailQuery = useQuery({
    ...orpc.logs.get.queryOptions({
      input: { id: selectedLogId ?? '', projectId },
    }),
    enabled: selectedLogId !== null,
  });

  const logs = logsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <StatusDot
              label={paused ? 'Updates paused' : 'Updating live'}
              tone={paused ? 'cancelled' : 'active'}
            />
            <Button
              onClick={() => setPaused((value) => !value)}
              size="sm"
              type="button"
              variant="outline"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
              {paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        }
        description="Recent sends and test messages for this project. Click a row for details."
        title="Logs"
      />

      <section className="bg-card ring-border overflow-hidden rounded-[var(--radius-panel)] ring-1">
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
          <LogsTable
            logs={logs}
            onSelect={setSelectedLogId}
            selectedId={selectedLogId}
          />
        )}

        {logs.length >= LOGS_LIST_LIMIT ? (
          <p className="text-kbd text-muted-foreground border-border border-t px-4 py-3">
            Showing latest {LOGS_LIST_LIMIT} entries
          </p>
        ) : null}
      </section>

      <LogDetailSheet
        isLoading={detailQuery.isPending}
        log={detailQuery.data}
        onClose={() => setSelectedLogId(null)}
      />
    </div>
  );
}
