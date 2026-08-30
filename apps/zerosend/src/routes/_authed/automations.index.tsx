import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router';
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
import { Plus, Trash2, Workflow } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { orpc } from '@/utils/orpc';

const authedRoute = getRouteApi('/_authed');

export const Route = createFileRoute('/_authed/automations/')({
  component: AutomationsPage,
});

function AutomationsPage() {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { currentProject } = authedRoute.useLoaderData();
  const projectId = currentProject.id;

  const automationsQuery = useQuery(
    orpc.automations.list.queryOptions({ input: { projectId } })
  );
  const startersQuery = useQuery(orpc.automations.listStarters.queryOptions());

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [automationName, setAutomationName] = useState('');
  const [starterTemplateId, setStarterTemplateId] = useState<string>('');

  const createAutomation = useMutation(
    orpc.automations.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (result) => {
        setCreateOpen(false);
        setAutomationName('');
        setStarterTemplateId('');
        queryClient.invalidateQueries({
          queryKey: orpc.automations.list.key(),
        });
        toast.success('Automation created');
        navigate({ params: { id: result.id }, to: '/automations/$id' });
      },
    })
  );

  const deleteAutomation = useMutation(
    orpc.automations.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        setDeleteId(null);
        queryClient.invalidateQueries({
          queryKey: orpc.automations.list.key(),
        });
        toast.success('Automation deleted');
      },
    })
  );

  const automations = automationsQuery.data ?? [];
  const starters = startersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setCreateOpen(true)} type="button">
            <Plus className="size-4" />
            New automation
          </Button>
        }
        description="Build event-driven email workflows with delays, branches, and template sends."
        title="Automations"
      />

      {automationsQuery.isLoading ? (
        <p className="text-body text-muted-foreground">Loading automations…</p>
      ) : automations.length === 0 ? (
        <EmptyState
          description="Start from a starter workflow or create a blank automation canvas."
          icon={Workflow}
          title="No automations yet"
        />
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-nav text-muted-foreground border-border border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Runs</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {automations.map((automation) => (
                <tr
                  className="border-border border-b last:border-b-0"
                  key={automation.id}
                >
                  <td className="text-body px-4 py-3">
                    <Link
                      className="text-foreground hover:underline"
                      params={{ id: automation.id }}
                      to="/automations/$id"
                    >
                      {automation.name}
                    </Link>
                    <p className="text-nav text-muted-foreground font-mono">
                      {automation.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusDot
                        tone={automation.publishedAt ? 'completed' : 'active'}
                      />
                      <span className="text-body">
                        {automation.publishedAt ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="text-body px-4 py-3">{automation.runCount}</td>
                  <td
                    className="text-body text-muted-foreground px-4 py-3"
                    suppressHydrationWarning
                  >
                    {automation.updatedAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        nativeButton={false}
                        render={
                          <Link
                            params={{ id: automation.id }}
                            to="/automations/$id"
                          />
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        aria-label={`Delete ${automation.name}`}
                        onClick={() => setDeleteId(automation.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog onOpenChange={setCreateOpen} open={createOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create automation</DialogTitle>
            <DialogDescription>
              Choose a starter workflow or start from a blank canvas.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createAutomation.mutate({
                name: automationName.trim(),
                projectId,
                starterTemplateId: starterTemplateId || undefined,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="automation-name">Name</Label>
              <Input
                id="automation-name"
                onChange={(event) => setAutomationName(event.target.value)}
                placeholder="Welcome users"
                required
                value={automationName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="starter-template">Starter template</Label>
              <select
                className="border-input bg-background text-body focus-visible:border-ring h-9 w-full rounded-md border px-3 outline-none"
                id="starter-template"
                onChange={(event) => setStarterTemplateId(event.target.value)}
                value={starterTemplateId}
              >
                <option value="">Blank canvas</option>
                {starters.map((starter) => (
                  <option key={starter.id} value={starter.id}>
                    {starter.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button disabled={createAutomation.isPending} type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
        open={deleteId !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete automation</DialogTitle>
            <DialogDescription>
              This removes the draft and published workflow definition.
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
              disabled={deleteAutomation.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteAutomation.mutate({ id: deleteId, projectId });
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
    </div>
  );
}
