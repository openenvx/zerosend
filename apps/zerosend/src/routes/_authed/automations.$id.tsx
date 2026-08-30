import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { createClientOnlyFn } from '@tanstack/react-start';
import { Button } from '@zerosend/ui/components/button';
import { Input } from '@zerosend/ui/components/input';
import { Save, Upload } from 'lucide-react';
import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { AutomationBuilderHandle } from '@/components/automations/automation-builder.client';
import { AutomationRunsPanel } from '@/components/automations/automation-runs-panel';
import { FullscreenEditorLayout } from '@/components/fullscreen-editor-layout';
import Loader from '@/components/loader';
import { orpc } from '@/utils/orpc';

const loadAutomationBuilder = createClientOnlyFn(() =>
  import('@/components/automations/automation-builder.client').then(
    (module) => ({
      default: module.AutomationBuilder,
    })
  )
);

const AutomationBuilder = lazy(() => loadAutomationBuilder());

const authedRoute = getRouteApi('/_authed');

export const Route = createFileRoute('/_authed/automations/$id')({
  component: AutomationDetailPage,
  pendingComponent: AutomationDetailPending,
  ssr: false,
  staticData: { fullscreen: true },
});

function AutomationDetailPending() {
  return <Loader />;
}

function AutomationDetailPage() {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { id } = Route.useParams();
  const { currentProject } = authedRoute.useLoaderData();
  const projectId = currentProject.id;
  const builderRef = useRef<AutomationBuilderHandle>(null);

  const [activeTab, setActiveTab] = useState<'builder' | 'runs'>('builder');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testEvent, setTestEvent] = useState('user.signup');
  const [dirty, setDirty] = useState(false);

  const automationQuery = useQuery(
    orpc.automations.get.queryOptions({ input: { id, projectId } })
  );
  const templatesQuery = useQuery(
    orpc.templates.list.queryOptions({ input: { projectId } })
  );
  const runsQuery = useQuery(
    orpc.automations.runsList.queryOptions({
      input: { automationId: id, projectId },
    })
  );
  const runDetailQuery = useQuery({
    ...orpc.automations.runGet.queryOptions({
      input: {
        automationId: id,
        projectId,
        runId: selectedRunId ?? '00000000-0000-4000-8000-000000000000',
      },
    }),
    enabled: selectedRunId !== null,
  });

  const saveGraph = useMutation(
    orpc.automations.saveGraph.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.automations.get.key({ input: { id, projectId } }),
        });
      },
    })
  );

  const publishAutomation = useMutation(
    orpc.automations.publish.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.automations.get.key({ input: { id, projectId } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.automations.list.key(),
        });
        toast.success('Automation published');
      },
    })
  );

  const testEventMutation = useMutation(
    orpc.automations.testEvent.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (result) => {
        queryClient.invalidateQueries({
          queryKey: orpc.automations.runsList.key({
            input: { automationId: id, projectId },
          }),
        });
        if (result.runIds.length === 0) {
          toast.message('No published automation matched that event');
          return;
        }
        if (result.runIds[0]) {
          setSelectedRunId(result.runIds[0]);
          setActiveTab('runs');
        }
        toast.success('Test event sent');
      },
    })
  );

  const handleSaveGraph = useCallback(
    (graphJson: string) => {
      saveGraph.mutate({ graphJson, id, projectId });
    },
    [id, projectId, saveGraph]
  );

  const handlePublish = useCallback(
    (graphJson: string) => {
      publishAutomation.mutate({ graphJson, id, projectId });
    },
    [id, projectId, publishAutomation]
  );

  if (automationQuery.isLoading) {
    return (
      <FullscreenEditorLayout
        backLabel="Automations"
        backTo="/automations"
        title="Loading…"
      >
        <div className="text-body text-muted-foreground flex flex-1 items-center justify-center">
          Loading automation…
        </div>
      </FullscreenEditorLayout>
    );
  }

  if (automationQuery.isError || !automationQuery.data) {
    return (
      <FullscreenEditorLayout
        backLabel="Automations"
        backTo="/automations"
        title="Automation not found"
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-body text-muted-foreground">
            Automation not found.
          </p>
          <Button
            onClick={() => {
              navigate({ to: '/automations' });
            }}
            type="button"
            variant="outline"
          >
            Back to automations
          </Button>
        </div>
      </FullscreenEditorLayout>
    );
  }

  const automation = automationQuery.data;
  const templates = templatesQuery.data ?? [];
  const runs = runsQuery.data ?? [];

  return (
    <FullscreenEditorLayout
      actions={
        activeTab === 'builder' ? (
          <>
            <span className="text-nav text-muted-foreground hidden sm:inline">
              {dirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <Button
              disabled={saveGraph.isPending}
              onClick={() => builderRef.current?.save()}
              type="button"
              variant="outline"
            >
              <Save className="size-4" />
              Save draft
            </Button>
            <Button
              disabled={publishAutomation.isPending}
              onClick={() => builderRef.current?.publish()}
              type="button"
            >
              <Upload className="size-4" />
              Publish
            </Button>
          </>
        ) : null
      }
      backLabel="Automations"
      backTo="/automations"
      meta={
        <>
          <span className="text-muted-foreground hidden font-mono text-sm sm:inline">
            {automation.id}
          </span>
          {automation.publishedAt ? (
            <span
              className="text-muted-foreground text-sm"
              suppressHydrationWarning
            >
              Published {automation.publishedAt.toLocaleString()}
            </span>
          ) : null}
        </>
      }
      status={{
        label: automation.publishedAt ? 'Published' : 'Draft',
        tone: automation.publishedAt ? 'completed' : 'active',
      }}
      title={automation.name}
      toolbar={
        <>
          <Button
            onClick={() => setActiveTab('builder')}
            size="sm"
            type="button"
            variant={activeTab === 'builder' ? 'default' : 'outline'}
          >
            Builder
          </Button>
          <Button
            onClick={() => setActiveTab('runs')}
            size="sm"
            type="button"
            variant={activeTab === 'runs' ? 'default' : 'outline'}
          >
            Runs
          </Button>
          {activeTab === 'builder' ? (
            <>
              <div className="bg-border mx-1 hidden h-5 w-px sm:block" />
              <Input
                aria-label="Test recipient"
                className="h-8 w-44"
                onChange={(event) => setTestEmail(event.target.value)}
                placeholder="test@example.com"
                type="email"
                value={testEmail}
              />
              <Input
                aria-label="Test event"
                className="h-8 w-36"
                onChange={(event) => setTestEvent(event.target.value)}
                placeholder="user.signup"
                value={testEvent}
              />
              <Button
                disabled={testEventMutation.isPending}
                onClick={() =>
                  testEventMutation.mutate({
                    automationId: id,
                    email: testEmail,
                    event: testEvent,
                    projectId,
                  })
                }
                size="sm"
                type="button"
                variant="outline"
              >
                Send test event
              </Button>
            </>
          ) : null}
        </>
      }
    >
      {activeTab === 'builder' ? (
        <Suspense
          fallback={
            <div className="text-body text-muted-foreground flex flex-1 items-center justify-center">
              Loading builder…
            </div>
          }
        >
          <AutomationBuilder
            graphJson={automation.graphJson}
            onDirtyChange={setDirty}
            onPublish={handlePublish}
            onSaveGraph={handleSaveGraph}
            ref={builderRef}
            templates={templates.map((template) => ({
              id: template.id,
              name: template.name,
            }))}
          />
        </Suspense>
      ) : (
        <AutomationRunsPanel
          onSelectRun={setSelectedRunId}
          runDetail={selectedRunId ? (runDetailQuery.data ?? null) : null}
          runs={runs}
          selectedRunId={selectedRunId}
        />
      )}
    </FullscreenEditorLayout>
  );
}
