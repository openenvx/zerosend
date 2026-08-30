import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { createClientOnlyFn } from '@tanstack/react-start';
import { Button } from '@zerosend/ui/components/button';
import { lazy, Suspense, useCallback } from 'react';
import { toast } from 'sonner';

import { FullscreenViewport } from '@/components/fullscreen-editor-layout';
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
  // @openenvx/email-studio is browser-only — keep this route off the Worker SSR graph.
  ssr: false,
  component: TemplateDetailPage,
  pendingComponent: TemplateDetailPending,
  staticData: { fullscreen: true },
});

function TemplateDetailPending() {
  return (
    <FullscreenViewport>
      <Loader />
    </FullscreenViewport>
  );
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

  const handleSaveScene = useCallback(
    (sceneJson: string) => {
      saveScene.mutate({ id, projectId, sceneJson });
    },
    [id, projectId, saveScene]
  );

  if (templateQuery.isLoading) {
    return (
      <FullscreenViewport>
        <div className="text-body text-muted-foreground">Loading template…</div>
      </FullscreenViewport>
    );
  }

  if (templateQuery.isError || !templateQuery.data) {
    return (
      <FullscreenViewport>
        <div className="flex flex-col items-center gap-4">
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
      </FullscreenViewport>
    );
  }

  const template = templateQuery.data;

  return (
    <FullscreenViewport>
      <Suspense
        fallback={
          <div className="text-body text-muted-foreground">Loading editor…</div>
        }
      >
        <TemplateEditorOpenenvx
          editorTitle={template.name}
          onSaveScene={handleSaveScene}
          sceneJson={template.sceneJson}
          templateId={template.id}
        />
      </Suspense>
    </FullscreenViewport>
  );
}
