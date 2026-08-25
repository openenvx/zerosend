import { Link } from '@tanstack/react-router';
import { sendEmailInputSchema } from '@zerosend/api/send/send-email';
import { Button } from '@zerosend/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zerosend/ui/components/dialog';
import { Input } from '@zerosend/ui/components/input';
import { Label } from '@zerosend/ui/components/label';
import { Textarea } from '@zerosend/ui/components/textarea';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TestKeyOption {
  id: string;
  name: string;
  prefix: string;
}

interface SendTestEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testKeys: TestKeyOption[];
  defaultFrom: string;
  isPending: boolean;
  onSend: (input: {
    keyId: string;
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }) => void;
}

export function SendTestEmailDialog({
  open,
  onOpenChange,
  testKeys,
  defaultFrom,
  isPending,
  onSend,
}: SendTestEmailDialogProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<p>Hello from Zerosend</p>');
  const [text, setText] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState('');

  useEffect(() => {
    if (defaultFrom) {
      setFrom(defaultFrom);
    }
  }, [defaultFrom]);

  useEffect(() => {
    if (testKeys.length > 0 && selectedKeyId === '') {
      setSelectedKeyId(testKeys[0]?.id ?? '');
    }
  }, [testKeys, selectedKeyId]);

  useEffect(() => {
    if (!open) {
      setSubject('');
      setTo('');
      setText('');
      setHtml('<p>Hello from Zerosend</p>');
      setSelectedKeyId('');
    }
  }, [open]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Send test email</DialogTitle>
          <DialogDescription>
            Stores the message in the mailbox using a test API key.
          </DialogDescription>
        </DialogHeader>

        {testKeys.length === 0 ? (
          <div className="space-y-4">
            <p className="text-body text-muted-foreground">
              Create a test API key in Settings before sending.
            </p>
            <DialogFooter className="shrink-0">
              <Button render={<Link to="/settings" />} type="button">
                Go to Settings
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
            onSubmit={(event) => {
              event.preventDefault();

              const payload = {
                from: from.trim(),
                html: html.trim() === '' ? undefined : html,
                subject: subject.trim(),
                text: text.trim() === '' ? undefined : text,
                to: to.trim(),
              };

              const parsed = sendEmailInputSchema.safeParse(payload);
              if (!parsed.success) {
                toast.error(
                  parsed.error.issues[0]?.message ?? 'Invalid email payload'
                );
                return;
              }

              onSend({
                keyId: selectedKeyId,
                ...parsed.data,
              });
            }}
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label htmlFor="mailbox-key">Test key</Label>
                <select
                  className="border-border bg-input/40 text-body text-foreground focus-visible:border-ring flex h-9 w-full rounded-md border px-3 outline-none"
                  id="mailbox-key"
                  onChange={(event) => setSelectedKeyId(event.target.value)}
                  required
                  value={selectedKeyId}
                >
                  {testKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.prefix}…)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mailbox-from">From</Label>
                  <Input
                    id="mailbox-from"
                    onChange={(event) => setFrom(event.target.value)}
                    required
                    type="email"
                    value={from}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mailbox-to">To</Label>
                  <Input
                    id="mailbox-to"
                    onChange={(event) => setTo(event.target.value)}
                    required
                    type="email"
                    value={to}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mailbox-subject">Subject</Label>
                <Input
                  id="mailbox-subject"
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  value={subject}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mailbox-html">HTML</Label>
                <Textarea
                  className="min-h-28 font-mono"
                  id="mailbox-html"
                  onChange={(event) => setHtml(event.target.value)}
                  value={html}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mailbox-text">Text (optional)</Label>
                <Textarea
                  className="min-h-20 font-mono"
                  id="mailbox-text"
                  onChange={(event) => setText(event.target.value)}
                  value={text}
                />
              </div>
            </div>

            <DialogFooter className="shrink-0">
              <Button disabled={isPending} type="submit">
                Send test
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
