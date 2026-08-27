import { StatusDot } from '@zerosend/ui/components/status-dot';
import type { StatusDotTone } from '@zerosend/ui/components/status-dot';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zerosend/ui/components/table';

import { formatLogTime } from '@/components/logs/log-detail-sheet';

export interface EmailLogListItem {
  id: string;
  subject: string;
  fromAddress: string;
  toAddress: string;
  status: string;
  isTest: boolean;
  apiKeyPrefix?: string | null;
  cloudflareMessageId?: string | null;
  templateId?: string | null;
  error?: string | null;
  createdAt: Date | number;
}

interface LogsTableProps {
  logs: EmailLogListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function logStatusTone(status: string): StatusDotTone {
  return status === 'failed' ? 'failed' : 'completed';
}

export function LogsTable({ logs, selectedId, onSelect }: LogsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3">
            Time
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3">
            Status
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3">
            Type
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3">
            Key
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3">
            Subject
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3 pe-4 text-right">
            To
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const active = selectedId === log.id;

          return (
            <TableRow
              className={`border-border cursor-pointer ${
                active
                  ? 'bg-[var(--color-module-hover)]'
                  : 'hover:bg-[var(--color-module-hover)]/60'
              }`}
              data-active={active}
              key={log.id}
              onClick={() => onSelect(log.id)}
            >
              <TableCell className="text-kbd text-muted-foreground px-4 py-3 tabular-nums">
                {formatLogTime(log.createdAt)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusDot
                  label={log.status}
                  tone={logStatusTone(log.status)}
                />
              </TableCell>
              <TableCell className="text-body text-muted-foreground px-4 py-3">
                {log.isTest ? 'Test' : 'Live'}
              </TableCell>
              <TableCell className="text-kbd text-muted-foreground px-4 py-3 font-mono">
                {log.apiKeyPrefix ? `${log.apiKeyPrefix}…` : '—'}
              </TableCell>
              <TableCell className="text-body text-foreground max-w-md px-4 py-3">
                <span className="block truncate">{log.subject}</span>
              </TableCell>
              <TableCell className="text-kbd text-muted-foreground px-4 py-3 pe-4 text-right font-mono">
                <span className="block max-w-[200px] truncate">
                  {log.toAddress}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
