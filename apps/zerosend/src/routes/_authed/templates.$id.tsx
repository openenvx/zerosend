import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router';
import { createClientOnlyFn } from '@tanstack/react-start';
import { Button } from '@zerosend/ui/components/button';
import { PageHeader } from '@zerosend/ui/components/page-header';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import { ArrowLeft } from 'lucide-react';
import { lazy, Suspense, useCallback } from 'react';
import { toast } from 'sonner';

import Loader from '@/components/loader';
import { orpc } from '@/utils/orpc';

const loadTemplateEditor = createClientOnlyFn(() =>
  import('@/components/templates/template-editor-openenvx.client').then(
    (module) => ({
      default: module.TemplateEditorOpenenvx,
    })
  )
);

const TemplateEditorOpenenvx = lazy(() => loadTemplateEditor());

const authedRoute = getRouteApi('/_authed');

export const Route = createFileRoute('/_authed/templates/$id')({
  // @openenvx/email is browser-only — keep this route off the Worker SSR graph.
  ssr: false,
  component: TemplateDetailPage,
  pendingComponent: TemplateDetailPending,
});

function TemplateDetailPending() {
  return <Loader />;
}

function TemplateDetailPage() {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { id } = Route.useParams();
  const { currentProject } = authedRoute.useLoaderData();
  const projectId = currentProject.id;

  const templateQuery = useQuery(
    orpc.templates.get.queryOptions({ input: { id, projectId } })
  );

  const saveScene = useMutation(
    orpc.templates.saveScene.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.templates.get.key({ input: { id, projectId } }),
        });
      },
    })
  );

  const publishTemplate = useMutation(
    orpc.templates.publish.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.templates.get.key({ input: { id, projectId } }),
        });
        queryClient.invalidateQueries({ queryKey: orpc.templates.list.key() });
        toast.success('Template published');
      },
    })
  );

  const handleSaveScene = useCallback(
    (sceneJson: string) => {
      saveScene.mutate({ id, projectId, sceneJson });
    },
    [id, projectId, saveScene]
  );

  const handlePublish = useCallback(
    (sceneJson: string) => {
      publishTemplate.mutate({
        id,
        projectId,
        sceneJson,
      });
    },
    [id, projectId, publishTemplate]
  );

  if (templateQuery.isLoading) {
    return (
      <div className="text-body text-muted-foreground">Loading template…</div>
    );
  }

  if (templateQuery.isError || !templateQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-body text-muted-foreground">Template not found.</p>
        <Button
          onClick={() => {
            navigate({ to: '/templates' });
          }}
          type="button"
          variant="outline"
        >
          Back to templates
        </Button>
      </div>
    );
  }

  const template = templateQuery.data;

  return (
    <div className="relative left-1/2 flex min-h-[calc(100svh-7rem)] w-screen max-w-none -translate-x-1/2 flex-col px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 py-2">
        <PageHeader
          action={
            <Button
              nativeButton={false}
              render={<Link to="/templates" />}
              variant="outline"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          }
          description="Design in OpenEnvx. Scene JSON autosaves; publish stores HTML/text snapshots for API sends."
          title={template.name}
        />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusDot tone={template.publishedAt ? 'success' : 'warning'} />
            <span>{template.publishedAt ? 'Published' : 'Draft'}</span>
          </div>
          <span className="text-muted-foreground font-mono">{template.id}</span>
          {template.publishedAt ? (
            <span className="text-muted-foreground" suppressHydrationWarning>
              Published {template.publishedAt.toLocaleString()}
            </span>
          ) : null}
          {saveScene.isPending ? (
            <span className="text-muted-foreground">Saving…</span>
          ) : null}
        </div>

        <Suspense
          fallback={
            <div className="text-body text-muted-foreground flex min-h-[50vh] items-center justify-center">
              Loading editor…
            </div>
          }
        >
          <TemplateEditorOpenenvx
            editorTitle={template.name}
            onPublish={handlePublish}
            onSaveScene={handleSaveScene}
            publishPending={publishTemplate.isPending}
            sceneJson={template.sceneJson}
            templateId={template.id}
          />
        </Suspense>
      </div>
    </div>
  );
}
