import { Button } from '@zerosend/ui/components/button';
import { EmptyState } from '@zerosend/ui/components/empty-state';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export interface MailboxMessageDetail {
  subject: string;
  fromAddress: string;
  toAddress: string;
  apiKeyPrefix: string | null;
  htmlBody: string | null;
  textBody: string | null;
}

interface MailboxMessagePreviewProps {
  message: MailboxMessageDetail | null | undefined;
}

export function MailboxMessagePreview({ message }: MailboxMessagePreviewProps) {
  const [previewTab, setPreviewTab] = useState<'html' | 'text'>('html');

  if (!message) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          description="Choose a message from the list to preview it."
          icon={Mail}
          title="Select a message"
        />
      </div>
    );
  }

  return (
    <>
      <div className="border-border border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-card-title text-foreground">{message.subject}</h2>
          <StatusDot label="Stored" tone="completed" />
        </div>
        <p className="text-kbd text-muted-foreground mt-1 font-mono">
          {message.fromAddress} → {message.toAddress}
        </p>
        {message.apiKeyPrefix ? (
          <p className="text-kbd text-muted-foreground mt-1">
            Key {message.apiKeyPrefix}…
          </p>
        ) : null}
      </div>

      <div className="border-border flex gap-2 border-b px-4 py-2">
        <Button
          onClick={() => setPreviewTab('html')}
          size="sm"
          type="button"
          variant={previewTab === 'html' ? 'default' : 'outline'}
        >
          Preview
        </Button>
        <Button
          onClick={() => setPreviewTab('text')}
          size="sm"
          type="button"
          variant={previewTab === 'text' ? 'default' : 'outline'}
        >
          Text
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {previewTab === 'html' ? (
          message.htmlBody ? (
            <iframe
              className="border-border h-[420px] w-full rounded-[var(--radius-control)] border bg-white"
              sandbox=""
              srcDoc={message.htmlBody}
              title="Email preview"
            />
          ) : (
            <p className="text-body text-muted-foreground">
              No HTML body for this message.
            </p>
          )
        ) : message.textBody ? (
          <pre className="text-body text-foreground font-mono whitespace-pre-wrap">
            {message.textBody}
          </pre>
        ) : (
          <p className="text-body text-muted-foreground">
            No text body for this message.
          </p>
        )}
      </div>
    </>
  );
}
