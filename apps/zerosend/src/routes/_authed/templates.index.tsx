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
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { orpc } from '@/utils/orpc';

const authedRoute = getRouteApi('/_authed');

export const Route = createFileRoute('/_authed/templates/')({
  component: TemplatesPage,
});

function TemplatesPage() {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { currentProject } = authedRoute.useLoaderData();
  const projectId = currentProject.id;

  const templatesQuery = useQuery(
    orpc.templates.list.queryOptions({ input: { projectId } })
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');

  const createTemplate = useMutation(
    orpc.templates.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (result) => {
        setCreateOpen(false);
        setTemplateName('');
        queryClient.invalidateQueries({ queryKey: orpc.templates.list.key() });
        toast.success('Template created');
        navigate({ params: { id: result.id }, to: '/templates/$id' });
      },
    })
  );

  const deleteTemplate = useMutation(
    orpc.templates.delete.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: orpc.templates.list.key() });
        toast.success('Template deleted');
      },
    })
  );

  const templates = templatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setCreateOpen(true)} type="button">
            <Plus className="size-4" />
            New template
          </Button>
        }
        description="Create reusable email templates for the current project. Publish before sending from your apps."
        title="Templates"
      />

      {templatesQuery.isLoading ? (
        <p className="text-body text-muted-foreground">Loading templates…</p>
      ) : templates.length === 0 ? (
        <EmptyState
          description="Create a template and design it in the visual editor, then publish for API sends."
          icon={FileText}
          title="No templates yet"
        />
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-nav text-muted-foreground border-border border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  className="border-border border-b last:border-b-0"
                  key={template.id}
                >
                  <td className="text-body px-4 py-3">
                    <Link
                      className="text-foreground hover:underline"
                      params={{ id: template.id }}
                      to="/templates/$id"
                    >
                      {template.name}
                    </Link>
                    <p className="text-nav text-muted-foreground font-mono">
                      {template.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusDot
                        tone={template.publishedAt ? 'success' : 'warning'}
                      />
                      <span className="text-body">
                        {template.publishedAt ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td
                    className="text-body text-muted-foreground px-4 py-3"
                    suppressHydrationWarning
                  >
                    {template.updatedAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        nativeButton={false}
                        render={
                          <Link
                            params={{ id: template.id }}
                            to="/templates/$id"
                          />
                        }
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        aria-label={`Delete ${template.name}`}
                        onClick={() => setDeleteId(template.id)}
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
            <DialogTitle>Create template</DialogTitle>
            <DialogDescription>
              Creates a draft template. Design it on the next screen and publish
              when ready.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createTemplate.mutate({
                name: templateName.trim(),
                projectId,
                // Editor seeds createEmailScene() when scene JSON is empty.
                sceneJson: '{}',
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Welcome email"
                required
                value={templateName}
              />
            </div>

            <DialogFooter>
              <Button disabled={createTemplate.isPending} type="submit">
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
            <DialogTitle>Delete template</DialogTitle>
            <DialogDescription>
              This removes the draft and published snapshots. Sends using this
              template id will fail.
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
              disabled={deleteTemplate.isPending}
              onClick={() => {
                if (deleteId) {
                  deleteTemplate.mutate({ id: deleteId, projectId });
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
