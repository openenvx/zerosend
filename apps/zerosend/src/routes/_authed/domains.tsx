import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@zerosend/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zerosend/ui/components/dialog';
import { EmptyState } from '@zerosend/ui/components/empty-state';
import { Input } from '@zerosend/ui/components/input';
import { Label } from '@zerosend/ui/components/label';
import { PageHeader } from '@zerosend/ui/components/page-header';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import { Copy, Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { orpc } from '@/utils/orpc';

export const Route = createFileRoute('/_authed/domains')({
  component: DomainsPage,
});

interface DnsRecord {
  content: string;
  name: string;
  priority: number | null;
  ttl: number | null;
  type: string;
}

function DomainsPage() {
  const queryClient = useQueryClient();
  const domainsQuery = useQuery(orpc.domains.list.queryOptions());

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dnsModal, setDnsModal] = useState<{
    domainName: string;
    records: DnsRecord[];
  } | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [domainName, setDomainName] = useState('');
  const [cfZoneId, setCfZoneId] = useState('');

  const createDomain = useMutation(
    orpc.domains.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        setCreateOpen(false);
        setDomainName('');
        setCfZoneId('');
        queryClient.invalidateQueries({ queryKey: orpc.domains.list.key() });
        toast.success('Domain added');
      },
    })
  );

  const deleteDomain = useMutation(
    orpc.domains.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: orpc.domains.list.key() });
        toast.success('Domain removed');
      },
    })
  );

  const verifyDomain = useMutation(
    orpc.domains.verify.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: orpc.domains.list.key() });
        toast.success(
          result.verified ? 'Domain verified' : 'Still pending - check DNS'
        );
      },
    })
  );

  const loadDns = useMutation(
    orpc.domains.dns.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (records, variables) => {
        const domain = domains.find((entry) => entry.id === variables.id);
        setDnsModal({
          domainName: domain?.name ?? 'Domain',
          records,
        });
      },
    })
  );

  const domains = domainsQuery.data?.domains ?? [];
  const cloudflareConfigured = domainsQuery.data?.cloudflareConfigured ?? false;

  async function handleVerify(id: string) {
    setVerifyingId(id);
    try {
      await verifyDomain.mutateAsync({ id });
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Onboard sending domains on this Cloudflare account. Copy DNS records and verify before live sends."
        title="Domains"
      />

      {!cloudflareConfigured ? (
        <div className="bg-card ring-border rounded-[var(--radius-panel)] p-4 ring-1">
          <p className="text-body text-foreground font-medium">
            Cloudflare API token not configured
          </p>
          <p className="text-body text-muted-foreground mt-2">
            Add domains from the dashboard requires{' '}
            <code className="text-kbd">CF_API_TOKEN</code> with Account Email
            Security Edit, Zone Email Routing Rules Edit, Zone Read, and DNS
            Read/Write. Set it with{' '}
            <code className="text-kbd">wrangler secret put CF_API_TOKEN</code>{' '}
            or in <code className="text-kbd">.dev.vars</code> for local dev.
          </p>
        </div>
      ) : null}

      <section className="bg-card ring-border rounded-[var(--radius-panel)] ring-1">
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-card-title text-foreground">Sending domains</h2>
            <p className="text-body text-muted-foreground">
              Instance-wide. Any project may send from a verified domain.
            </p>
          </div>
          <Button
            disabled={!cloudflareConfigured}
            onClick={() => setCreateOpen(true)}
            size="sm"
            type="button"
          >
            <Plus className="size-4" />
            Add domain
          </Button>
        </div>

        {domainsQuery.isPending ? (
          <div className="text-body text-muted-foreground p-6">
            Loading domains…
          </div>
        ) : domains.length === 0 ? (
          <EmptyState
            action={
              cloudflareConfigured ? (
                <Button onClick={() => setCreateOpen(true)} type="button">
                  Add your first domain
                </Button>
              ) : undefined
            }
            description="Add a domain on this Cloudflare account to send live email."
            icon={Globe}
            title="No domains yet"
          />
        ) : (
          <div className="divide-border divide-y">
            {domains.map((domain) => (
              <div
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={domain.id}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body text-foreground">{domain.name}</p>
                    <StatusDot
                      label={domain.verified ? 'Verified' : 'Pending'}
                      tone={domain.verified ? 'completed' : 'pending'}
                    />
                  </div>
                  {domain.returnPathDomain ? (
                    <p className="text-kbd text-muted-foreground font-mono">
                      Return path: {domain.returnPathDomain}
                    </p>
                  ) : null}
                  <p className="text-kbd text-muted-foreground">
                    Added {new Date(domain.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    disabled={loadDns.isPending || !cloudflareConfigured}
                    onClick={() => loadDns.mutate({ id: domain.id })}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    DNS
                  </Button>
                  <Button
                    disabled={
                      verifyingId === domain.id || !cloudflareConfigured
                    }
                    onClick={() => handleVerify(domain.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <RefreshCw
                      className={
                        verifyingId === domain.id
                          ? 'size-4 animate-spin'
                          : 'size-4'
                      }
                    />
                    Verify
                  </Button>
                  <Button
                    onClick={() => setDeleteId(domain.id)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add sending domain</DialogTitle>
            <DialogDescription>
              The domain must already be on this Cloudflare account. Zerosend
              will onboard it for Email Sending and show DNS records to copy.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createDomain.mutate({
                name: domainName.trim(),
                ...(cfZoneId.trim()
                  ? { cfZoneId: cfZoneId.trim() }
                  : undefined),
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="domain-name">Domain or subdomain</Label>
              <Input
                id="domain-name"
                onChange={(event) => setDomainName(event.target.value)}
                placeholder="mail.example.com"
                required
                value={domainName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-zone-id">
                Cloudflare Zone ID{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cf-zone-id"
                onChange={(event) => setCfZoneId(event.target.value)}
                placeholder="abc123def456"
                value={cfZoneId}
              />
            </div>
            <DialogFooter>
              <Button disabled={createDomain.isPending} type="submit">
                Add domain
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={() => setDeleteId(null)} open={deleteId !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete domain?</DialogTitle>
            <DialogDescription>
              Removes the domain from zerosend. This does not disable Email
              Sending in Cloudflare.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteId(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={deleteDomain.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteDomain.mutate({ id: deleteId });
                }
              }}
              type="button"
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDnsModal(null);
          }
        }}
        open={dnsModal !== null}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>DNS records</DialogTitle>
            <DialogDescription>{dnsModal?.domainName}</DialogDescription>
          </DialogHeader>
          <p className="text-body text-muted-foreground">
            Add these records at your DNS provider (or confirm Cloudflare
            auto-managed records) then click Verify.
          </p>
          <div className="space-y-2">
            {dnsModal?.records.map((record) => (
              <div
                className="bg-muted/40 ring-border rounded-[var(--radius-control)] p-3 ring-1"
                key={`${record.type}-${record.name}-${record.content}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1 font-mono text-xs">
                    <p>
                      <span className="text-muted-foreground">Type:</span>{' '}
                      {record.type}
                    </p>
                    <p className="break-all">
                      <span className="text-muted-foreground">Name:</span>{' '}
                      {record.name}
                    </p>
                    <p className="break-all">
                      <span className="text-muted-foreground">Content:</span>{' '}
                      {record.content}
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      await navigator.clipboard.writeText(record.content);
                      toast.success('Copied content');
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Copy className="size-4" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
