import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@zerosend/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@zerosend/ui/components/dialog";
import { EmptyState } from "@zerosend/ui/components/empty-state";
import { Input } from "@zerosend/ui/components/input";
import { Label } from "@zerosend/ui/components/label";
import { PageHeader } from "@zerosend/ui/components/page-header";
import { StatusDot } from "@zerosend/ui/components/status-dot";
import { KeyRound, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const keysQuery = useQuery(orpc.keys.list.queryOptions());
  const settingsQuery = useQuery(orpc.settings.get.queryOptions());

  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [defaultFrom, setDefaultFrom] = useState("");

  useEffect(() => {
    if (settingsQuery.data) {
      setDefaultFrom(settingsQuery.data.defaultFrom ?? "");
    }
  }, [settingsQuery.data]);

  const createKey = useMutation(
    orpc.keys.create.mutationOptions({
      onSuccess: (result) => {
        setCreatedKey(result.key);
        setKeyName("");
        queryClient.invalidateQueries({ queryKey: orpc.keys.list.key() });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const revokeKey = useMutation(
    orpc.keys.revoke.mutationOptions({
      onSuccess: () => {
        setRevokeId(null);
        queryClient.invalidateQueries({ queryKey: orpc.keys.list.key() });
        toast.success("API key revoked");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateSettings = useMutation(
    orpc.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.settings.get.key() });
        toast.success("Settings saved");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const keys = keysQuery.data ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        description="Manage operator settings and API keys for product integrations."
        title="Settings"
      />

      <section className="rounded-[var(--radius-panel)] bg-card p-4 ring-1 ring-border">
        <h2 className="text-card-title text-foreground">
          Default from address
        </h2>
        <p className="mt-1 text-body text-muted-foreground">
          Used as the default sender when product apps omit `from` (Phase 2).
        </p>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            updateSettings.mutate({
              defaultFrom:
                defaultFrom.trim() === "" ? null : defaultFrom.trim(),
            });
          }}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="default-from">Email address</Label>
            <Input
              id="default-from"
              onChange={(event) => setDefaultFrom(event.target.value)}
              placeholder="hello@yourdomain.com"
              type="email"
              value={defaultFrom}
            />
          </div>
          <Button disabled={updateSettings.isPending} type="submit">
            Save
          </Button>
        </form>
      </section>

      <section className="rounded-[var(--radius-panel)] bg-card ring-1 ring-border">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-card-title text-foreground">API keys</h2>
            <p className="text-body text-muted-foreground">
              Bearer keys for `POST /v1/*` from your other projects.
            </p>
          </div>
          <Button
            onClick={() => {
              setCreatedKey(null);
              setCreateOpen(true);
            }}
            size="sm"
            type="button"
          >
            <Plus className="size-4" />
            Create key
          </Button>
        </div>

        {keysQuery.isPending ? (
          <div className="p-6 text-body text-muted-foreground">
            Loading keys…
          </div>
        ) : keys.length === 0 ? (
          <EmptyState
            action={
              <Button
                onClick={() => {
                  setCreatedKey(null);
                  setCreateOpen(true);
                }}
                type="button"
              >
                Create your first key
              </Button>
            }
            description="Product apps authenticate with Bearer API keys."
            icon={KeyRound}
            title="No API keys yet"
          />
        ) : (
          <div className="divide-y divide-border">
            {keys.map((key) => (
              <div
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={key.id}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body text-foreground">{key.name}</p>
                    <StatusDot
                      label={key.active ? "Active" : "Revoked"}
                      tone={key.active ? "completed" : "cancelled"}
                    />
                  </div>
                  <p className="font-mono text-kbd text-muted-foreground">
                    {key.prefix}…
                  </p>
                  <p className="text-kbd text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleString()}
                  </p>
                </div>
                {key.active ? (
                  <Button
                    onClick={() => setRevokeId(key.id)}
                    type="button"
                    variant="outline"
                  >
                    Revoke
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreatedKey(null);
            setKeyName("");
          }
        }}
        open={createOpen}
      >
        <DialogContent>
          {createdKey ? (
            <>
              <DialogHeader>
                <DialogTitle>Copy your API key</DialogTitle>
                <DialogDescription>
                  This key is shown once. Store it in your product app secrets.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-[var(--radius-control)] bg-[var(--color-module-hover)] p-3">
                <code className="block break-all font-mono text-body text-foreground">
                  {createdKey}
                </code>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(createdKey);
                    toast.success("Copied to clipboard");
                  }}
                  type="button"
                >
                  Copy key
                </Button>
                <Button
                  onClick={() => {
                    setCreateOpen(false);
                    setCreatedKey(null);
                  }}
                  type="button"
                  variant="outline"
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Name this key so you can tell product integrations apart.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  createKey.mutate({ name: keyName.trim() });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="key-name">Name</Label>
                  <Input
                    id="key-name"
                    onChange={(event) => setKeyName(event.target.value)}
                    placeholder="Production worker"
                    required
                    value={keyName}
                  />
                </div>
                <DialogFooter>
                  <Button disabled={createKey.isPending} type="submit">
                    Create key
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={() => setRevokeId(null)} open={revokeId !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API key?</DialogTitle>
            <DialogDescription>
              Product apps using this key will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setRevokeId(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={revokeKey.isPending}
              onClick={() => {
                if (revokeId) {
                  revokeKey.mutate({ id: revokeId });
                }
              }}
              type="button"
              variant="destructive"
            >
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
