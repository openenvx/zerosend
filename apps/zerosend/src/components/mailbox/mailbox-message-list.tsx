import { formatRelativeTime } from '@/components/format-relative-time';

export interface MailboxMessageSummary {
  id: string;
  subject: string;
  toAddress: string;
  createdAt: Date | number;
}

interface MailboxMessageListProps {
  messages: MailboxMessageSummary[];
  selectedId: string | null;
  limit: number;
  onSelect: (id: string) => void;
}

export function MailboxMessageList({
  messages,
  selectedId,
  limit,
  onSelect,
}: MailboxMessageListProps) {
  return (
    <div className="border-border border-b lg:border-r lg:border-b-0">
      <div className="border-border border-b px-4 py-3">
        <p className="text-card-title text-foreground">Test inbox</p>
        <p className="text-kbd text-muted-foreground">
          {messages.length} message{messages.length === 1 ? '' : 's'}
          {messages.length >= limit ? ` · showing latest ${limit}` : null}
        </p>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {messages.map((message) => {
          const isSelected = message.id === selectedId;

          return (
            <button
              className={`border-border flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors ${
                isSelected
                  ? 'bg-[var(--color-module-hover)]'
                  : 'hover:bg-[var(--color-module-hover)]/60'
              }`}
              key={message.id}
              onClick={() => onSelect(message.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-body text-foreground truncate">
                  {message.subject}
                </p>
                <span className="text-kbd text-muted-foreground shrink-0">
                  {formatRelativeTime(new Date(message.createdAt))}
                </span>
              </div>
              <p className="text-kbd text-muted-foreground truncate font-mono">
                {message.toAddress}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
