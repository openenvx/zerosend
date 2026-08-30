import { Link } from '@tanstack/react-router';
import { Button } from '@zerosend/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@zerosend/ui/components/sheet';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import type { StatusDotTone } from '@zerosend/ui/components/status-dot';
import { CheckIcon, CopyIcon, MailIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export interface EmailLogDetail {
  id: string;
  subject: string;
  fromAddress: string;
  toAddress: string;
  status: string;
  isTest: boolean;
  apiKeyId: string | null;
  apiKeyPrefix: string | null;
  cloudflareMessageId: string | null;
  templateId: string | null;
  error: string | null;
  htmlBody: string | null;
  textBody: string | null;
  createdAt: Date | number;
}

interface LogDetailSheetProps {
  log: EmailLogDetail | null | undefined;
  isLoading?: boolean;
  onClose: () => void;
}

function logStatusTone(status: string): StatusDotTone {
  return status === 'failed' ? 'failed' : 'completed';
}

function formatLogTime(value: Date | number) {
  const date = new Date(value);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const millis = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

export function LogDetailSheet({
  log,
  isLoading = false,
  onClose,
}: LogDetailSheetProps) {
  const [bodyTab, setBodyTab] = useState<'html' | 'text'>('html');

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={!!log}>
      <SheetContent className="bg-popover flex w-full flex-col gap-0 overflow-hidden p-0 shadow-none data-[side=right]:sm:max-w-4xl">
        {log ? (
          <>
            <SheetHeader className="border-border shrink-0 space-y-2 border-b px-6 py-5 pr-14">
              <SheetTitle className="text-section text-foreground leading-snug font-semibold text-balance">
                {log.subject}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <StatusDot
                  label={log.status}
                  tone={logStatusTone(log.status)}
                />
                <span className="text-kbd text-muted-foreground">
                  {log.isTest ? 'Test message' : 'Live send'}
                </span>
              </div>
              <SheetDescription className="text-kbd text-muted-foreground m-0 tabular-nums">
                {new Date(log.createdAt).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Section title="Addresses">
                <KeyVal copy label="From" mono value={log.fromAddress} />
                <KeyVal copy label="To" mono value={log.toAddress} />
              </Section>

              <Section title="Identifiers">
                <KeyVal copy label="Log ID" mono value={log.id} />
                {log.cloudflareMessageId ? (
                  <KeyVal
                    copy
                    label="Message ID"
                    mono
                    value={log.cloudflareMessageId}
                  />
                ) : null}
                {log.apiKeyPrefix ? (
                  <KeyVal
                    copy
                    label="API key"
                    mono
                    value={`${log.apiKeyPrefix}…`}
                  />
                ) : null}
                {log.templateId ? (
                  <KeyVal copy label="Template" mono value={log.templateId} />
                ) : null}
              </Section>

              <Section title="Delivery">
                <KeyVal
                  label="Type"
                  value={log.isTest ? 'Test (mailbox)' : 'Live'}
                />
                <KeyVal
                  label="Time"
                  mono
                  value={formatLogTime(log.createdAt)}
                />
              </Section>

              {log.error ? (
                <Section title="Error">
                  <p className="text-body leading-relaxed text-[var(--status-failed)]">
                    {log.error}
                  </p>
                </Section>
              ) : null}

              {log.htmlBody || log.textBody ? (
                <Section title="Body">
                  <div className="mb-3 flex gap-2">
                    <Button
                      disabled={!log.htmlBody}
                      onClick={() => setBodyTab('html')}
                      size="sm"
                      type="button"
                      variant={bodyTab === 'html' ? 'default' : 'outline'}
                    >
                      HTML
                    </Button>
                    <Button
                      disabled={!log.textBody}
                      onClick={() => setBodyTab('text')}
                      size="sm"
                      type="button"
                      variant={bodyTab === 'text' ? 'default' : 'outline'}
                    >
                      Text
                    </Button>
                  </div>
                  {bodyTab === 'html' && log.htmlBody ? (
                    <iframe
                      className="border-border h-[280px] w-full rounded-[var(--radius-control)] border bg-white"
                      sandbox=""
                      srcDoc={log.htmlBody}
                      title="Email HTML preview"
                    />
                  ) : bodyTab === 'text' && log.textBody ? (
                    <pre className="text-kbd text-foreground border-border max-h-[280px] overflow-auto rounded-[var(--radius-control)] border bg-[var(--color-slate)] p-3 font-mono whitespace-pre-wrap">
                      {log.textBody}
                    </pre>
                  ) : (
                    <p className="text-body text-muted-foreground">
                      No {bodyTab} body for this message.
                    </p>
                  )}
                </Section>
              ) : null}

              {log.isTest ? (
                <div className="border-border border-t px-6 py-5">
                  <Button
                    render={<Link to="/mailbox" />}
                    size="sm"
                    variant="outline"
                  >
                    <MailIcon />
                    Open in mailbox
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : isLoading ? (
          <div className="text-body text-muted-foreground p-6">
            Loading log…
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-border border-b px-6 py-8 last:border-b-0">
      <h3 className="text-card-title text-foreground mb-6 font-medium">
        {title}
      </h3>
      <dl className="flex flex-col gap-4">{children}</dl>
    </section>
  );
}

function KeyVal({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      void navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="group grid grid-cols-[5.5rem_minmax(0,_1fr)] items-start gap-x-4">
      <dt className="text-kbd text-muted-foreground pt-0.5">{label}</dt>
      <dd className="flex min-w-0 items-start gap-2">
        <span
          className={`text-body text-foreground min-w-0 flex-1 leading-snug break-all ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </span>
        {copy ? (
          <button
            aria-label={`Copy ${label}`}
            className="text-muted-foreground hover:text-foreground inline-flex size-4 shrink-0 items-center justify-center rounded-[var(--radius-nav)] p-0 opacity-50 transition-colors group-hover:opacity-100 hover:bg-[var(--color-module-hover)] [&_svg]:!size-3"
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <CheckIcon className="size-3 text-[var(--status-completed)]" />
            ) : (
              <CopyIcon className="size-3" />
            )}
          </button>
        ) : null}
      </dd>
    </div>
  );
}

export { formatLogTime };
