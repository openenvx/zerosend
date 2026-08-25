import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Button } from '@zerosend/ui/components/button';
import { EmptyState } from '@zerosend/ui/components/empty-state';
import { PageHeader } from '@zerosend/ui/components/page-header';
import { Inbox, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MailboxMessageList } from '@/components/mailbox/mailbox-message-list';
import { MailboxMessagePreview } from '@/components/mailbox/mailbox-message-preview';
import { SendTestEmailDialog } from '@/components/mailbox/send-test-email-dialog';
import { orpc } from '@/utils/orpc';

const MAILBOX_LIST_LIMIT = 100;

export const Route = createFileRoute('/_authed/mailbox')({
  component: MailboxPage,
});

function MailboxPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);

  const mailboxQuery = useQuery(orpc.mailbox.list.queryOptions());
  const keysQuery = useQuery(orpc.keys.list.queryOptions());
  const settingsQuery = useQuery(orpc.settings.get.queryOptions());
  const detailQuery = useQuery({
    ...orpc.mailbox.get.queryOptions({ input: { id: selectedId ?? '' } }),
    enabled: selectedId !== null,
  });

  const testKeys =
    keysQuery.data?.filter((key) => key.active && key.keyType === 'test') ?? [];

  useEffect(() => {
    const firstMessage = mailboxQuery.data?.[0];
    if (firstMessage && selectedId === null) {
      setSelectedId(firstMessage.id);
    }
  }, [mailboxQuery.data, selectedId]);

  const sendTest = useMutation(
    orpc.mailbox.send.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: orpc.mailbox.list.key() });
        queryClient.invalidateQueries({ queryKey: orpc.logs.list.key() });
        setSelectedId(result.id);
        setSendOpen(false);
        toast.success('Test email stored in mailbox');
      },
    })
  );

  const messages = mailboxQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setSendOpen(true)} size="sm" type="button">
            <Plus className="size-4" />
            Send test
          </Button>
        }
        description="Preview test sends stored by zs_test_ keys. Nothing leaves this Worker."
        title="Mailbox"
      />

      {mailboxQuery.isPending ? (
        <div className="bg-card text-body text-muted-foreground ring-border rounded-[var(--radius-panel)] p-6 ring-1">
          Loading mailbox…
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          action={
            testKeys.length > 0 ? (
              <Button onClick={() => setSendOpen(true)} type="button">
                Send test email
              </Button>
            ) : (
              <Button render={<Link to="/settings" />} type="button">
                Create a test key
              </Button>
            )
          }
          description="Send with a zs_test_ key from the playground or POST /v1/emails."
          icon={Inbox}
          title="No test messages yet"
        />
      ) : (
        <div className="bg-card ring-border grid min-h-[520px] gap-0 overflow-hidden rounded-[var(--radius-panel)] ring-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <MailboxMessageList
            limit={MAILBOX_LIST_LIMIT}
            messages={messages}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />

          <div className="flex min-h-[480px] flex-col">
            <MailboxMessagePreview message={detailQuery.data} />
          </div>
        </div>
      )}

      <SendTestEmailDialog
        defaultFrom={settingsQuery.data?.defaultFrom ?? ''}
        isPending={sendTest.isPending}
        onOpenChange={setSendOpen}
        onSend={(input) => sendTest.mutate(input)}
        open={sendOpen}
        testKeys={testKeys}
      />
    </div>
  );
}
