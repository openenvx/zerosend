import { StatusDot } from '@zerosend/ui/components/status-dot';

export interface EmailLogRowData {
  id: string;
  subject: string;
  fromAddress: string;
  toAddress: string;
  status: string;
  isTest?: boolean;
  apiKeyPrefix?: string | null;
  error?: string | null;
  cloudflareMessageId?: string | null;
  createdAt: Date | number;
}

interface EmailLogRowProps {
  log: EmailLogRowData;
}

export function EmailLogRow({ log }: EmailLogRowProps) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-body text-foreground truncate">{log.subject}</p>
          <StatusDot
            label={log.status}
            tone={log.status === 'sent' ? 'completed' : 'failed'}
          />
          {log.isTest ? (
            <span className="text-kbd text-muted-foreground">Test</span>
          ) : null}
        </div>
        <p className="text-kbd text-muted-foreground font-mono">
          {log.fromAddress} → {log.toAddress}
        </p>
        <div className="text-kbd text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
          {log.apiKeyPrefix ? <span>{log.apiKeyPrefix}</span> : null}
          {log.cloudflareMessageId ? (
            <span className="truncate">id {log.cloudflareMessageId}</span>
          ) : null}
          {log.error ? (
            <span className="text-(--status-failed)">{log.error}</span>
          ) : null}
        </div>
      </div>
      <p className="text-kbd text-muted-foreground shrink-0">
        {new Date(log.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
