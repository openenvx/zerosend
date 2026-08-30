import { StatusDot } from '@zerosend/ui/components/status-dot';
import { cn } from '@zerosend/ui/lib/utils';

interface AutomationRunStep {
  completedAt: Date | null;
  error: string | null;
  id: string;
  nodeId: string;
  nodeType: string;
  outputJson: string | null;
  resumeAtMs: number | null;
  startedAt: Date | null;
  status: string;
  waitEvent: string | null;
}

interface AutomationRunDetail {
  completedAt: Date | null;
  createdAt: Date;
  id: string;
  recipientEmail: string;
  status: string;
  steps: AutomationRunStep[];
  triggerEvent: string;
  triggerPayloadJson: string;
}

interface AutomationRunsPanelProps {
  onSelectRun: (runId: string) => void;
  runDetail: AutomationRunDetail | null;
  runs: {
    completedAt: Date | null;
    createdAt: Date;
    id: string;
    recipientEmail: string;
    status: string;
    triggerEvent: string;
  }[];
  selectedRunId: string | null;
}

function runTone(
  status: string
): 'active' | 'completed' | 'failed' | 'pending' {
  switch (status) {
    case 'completed': {
      return 'completed';
    }
    case 'failed': {
      return 'failed';
    }
    case 'running': {
      return 'active';
    }
    default: {
      return 'pending';
    }
  }
}

export function AutomationRunsPanel({
  onSelectRun,
  runDetail,
  runs,
  selectedRunId,
}: AutomationRunsPanelProps) {
  return (
    <div className="grid h-full min-h-0 flex-1 gap-4 overflow-hidden p-3 md:grid-cols-[320px_minmax(0,1fr)] md:p-4">
      <div className="border-border flex min-h-0 flex-col overflow-hidden rounded-lg border">
        <div className="bg-muted/40 text-nav text-muted-foreground border-border shrink-0 border-b px-4 py-3 font-medium">
          Runs
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {runs.length === 0 ? (
            <p className="text-body text-muted-foreground p-4">
              No runs yet. Publish and send a custom event to start a workflow.
            </p>
          ) : (
            runs.map((run) => (
              <button
                className={cn(
                  'border-border hover:bg-muted/30 flex w-full flex-col gap-1 border-b px-4 py-3 text-left last:border-b-0',
                  selectedRunId === run.id && 'bg-muted/40'
                )}
                key={run.id}
                onClick={() => onSelectRun(run.id)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <StatusDot tone={runTone(run.status)} />
                  <span className="text-body truncate">
                    {run.recipientEmail}
                  </span>
                </div>
                <span className="text-nav text-muted-foreground">
                  {run.triggerEvent} ·{' '}
                  <span suppressHydrationWarning>
                    {run.createdAt.toLocaleString()}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border-border min-h-0 overflow-y-auto rounded-lg border p-4">
        {!runDetail ? (
          <p className="text-body text-muted-foreground">
            Select a run to inspect each step.
          </p>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-section">{runDetail.recipientEmail}</p>
              <p className="text-nav text-muted-foreground">
                {runDetail.triggerEvent} · {runDetail.status}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-card-title">Trigger payload</p>
              <pre className="bg-muted/30 text-nav overflow-x-auto rounded-md p-3 font-mono">
                {JSON.stringify(
                  JSON.parse(runDetail.triggerPayloadJson) as unknown,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="space-y-3">
              <p className="text-card-title">Steps</p>
              {runDetail.steps.map((step) => (
                <div
                  className="border-border rounded-md border px-3 py-3"
                  key={step.id}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot tone={runTone(step.status)} />
                    <span className="text-body font-mono">{step.nodeId}</span>
                    <span className="text-nav text-muted-foreground">
                      {step.nodeType}
                    </span>
                  </div>
                  {step.waitEvent ? (
                    <p className="text-nav text-muted-foreground mt-2">
                      Waiting for {step.waitEvent}
                      {step.resumeAtMs
                        ? ` · timeout ${new Date(step.resumeAtMs).toLocaleString()}`
                        : null}
                    </p>
                  ) : null}
                  {step.error ? (
                    <p className="text-body mt-2 text-[var(--status-failed)]">
                      {step.error}
                    </p>
                  ) : null}
                  {step.outputJson ? (
                    <pre className="bg-muted/30 text-nav mt-2 overflow-x-auto rounded-md p-2 font-mono">
                      {JSON.stringify(
                        JSON.parse(step.outputJson) as unknown,
                        null,
                        2
                      )}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
