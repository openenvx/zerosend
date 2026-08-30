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
  templateName?: string | null;
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

function logDisplayLabel(log: EmailLogListItem) {
  return log.templateName ?? log.subject;
}

export function LogsTable({ logs, selectedId, onSelect }: LogsTableProps) {
  return (
    <Table className="w-full table-fixed">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-kbd text-muted-foreground h-auto w-[7rem] px-4 py-3">
            Status
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto w-[9rem] px-4 py-3">
            Time
          </TableHead>
          <TableHead className="text-kbd text-muted-foreground h-auto px-4 py-3">
            Subject / template
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
              <TableCell className="px-4 py-3">
                <StatusDot
                  label={log.status}
                  tone={logStatusTone(log.status)}
                />
              </TableCell>
              <TableCell className="text-kbd text-muted-foreground px-4 py-3 tabular-nums">
                {formatLogTime(log.createdAt)}
              </TableCell>
              <TableCell className="text-body text-foreground px-4 py-3 pe-4">
                <span className="block truncate">{logDisplayLabel(log)}</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
