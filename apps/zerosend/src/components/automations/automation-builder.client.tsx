import '@xyflow/react/dist/style.css';
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import type { AutomationNodeType } from '@zerosend/api/automations/graph-schema';
import { Plus } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AutomationConfigPanel } from './automation-config-panel';
import { automationNodeTypes } from './automation-nodes';
import {
  createDefaultNodeData,
  createNodeId,
  nodePalette,
  type AutomationBuilderGraph,
} from './automation-types';

interface TemplateOption {
  id: string;
  name: string;
}

export interface AutomationBuilderHandle {
  publish: () => void;
  save: () => void;
}

interface AutomationBuilderProps {
  graphJson: string;
  onDirtyChange?: (dirty: boolean) => void;
  onPublish: (graphJson: string) => void;
  onSaveGraph: (graphJson: string) => void;
  ref?: React.Ref<AutomationBuilderHandle>;
  templates: TemplateOption[];
}

function parseGraph(graphJson: string): AutomationBuilderGraph {
  const parsed = JSON.parse(graphJson) as AutomationBuilderGraph;
  return {
    edges: parsed.edges ?? [],
    nodes: parsed.nodes ?? [],
  };
}

function serializeGraph(nodes: Node[], edges: Edge[]): string {
  const graph: AutomationBuilderGraph = {
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle:
        edge.sourceHandle as AutomationBuilderGraph['edges'][number]['sourceHandle'],
      target: edge.target,
    })),
    nodes: nodes.map((node) => ({
      data: node.data as Record<string, unknown>,
      id: node.id,
      position: node.position,
      type: node.type as AutomationNodeType,
    })),
  };

  return JSON.stringify(graph);
}

function toFlowNodes(graph: AutomationBuilderGraph): Node[] {
  return graph.nodes.map((node) => ({
    data: node.data,
    id: node.id,
    position: node.position,
    type: node.type,
  }));
}

function toFlowEdges(graph: AutomationBuilderGraph): Edge[] {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
  }));
}

export function AutomationBuilder({
  graphJson,
  onDirtyChange,
  onPublish,
  onSaveGraph,
  ref,
  templates,
}: AutomationBuilderProps) {
  const initial = useMemo(() => parseGraph(graphJson), [graphJson]);
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(initial));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initial));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const hydratedRef = useRef(graphJson);

  useEffect(() => {
    if (hydratedRef.current === graphJson) {
      return;
    }

    const graph = parseGraph(graphJson);
    setNodes(toFlowNodes(graph));
    setEdges(toFlowEdges(graph));
    hydratedRef.current = graphJson;
    setDirty(false);
  }, [graphJson, setEdges, setNodes]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.target}-${connection.sourceHandle ?? 'default'}`,
          },
          current
        )
      );
      setDirty(true);
    },
    [setEdges]
  );

  const handleAddNode = useCallback(
    (type: AutomationNodeType) => {
      if (type === 'trigger' && nodes.some((node) => node.type === 'trigger')) {
        return;
      }

      const id = createNodeId(type);
      const nextNode: Node = {
        data: createDefaultNodeData(type),
        id,
        position: {
          x: 120 + nodes.length * 40,
          y: 120 + nodes.length * 24,
        },
        type,
      };

      setNodes((current) => [...current, nextNode]);
      setSelectedNodeId(id);
      setDirty(true);
    },
    [nodes, setNodes]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
      setDirty(true);
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      setDirty(true);
    },
    [selectedNodeId, setEdges, setNodes]
  );

  const currentGraphJson = useMemo(
    () => serializeGraph(nodes, edges),
    [edges, nodes]
  );

  const handleSave = useCallback(() => {
    onSaveGraph(currentGraphJson);
    setDirty(false);
  }, [currentGraphJson, onSaveGraph]);

  const handlePublish = useCallback(() => {
    onPublish(currentGraphJson);
    setDirty(false);
  }, [currentGraphJson, onPublish]);

  useImperativeHandle(
    ref,
    () => ({
      publish: handlePublish,
      save: handleSave,
    }),
    [handlePublish, handleSave]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 p-3 md:p-4">
      <div className="grid h-full min-h-0 flex-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="border-border bg-card space-y-2 overflow-y-auto rounded-lg border p-3">
          <p className="text-nav text-muted-foreground px-1">Add step</p>
          {nodePalette.map((item) => (
            <button
              className="hover:bg-muted/50 border-border flex w-full items-start gap-2 rounded-md border px-2 py-2 text-left"
              key={item.type}
              onClick={() => handleAddNode(item.type)}
              type="button"
            >
              <Plus className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
              <span>
                <span className="text-body block">{item.label}</span>
                <span className="text-nav text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </button>
          ))}
        </aside>

        <div className="border-border bg-card relative min-h-0 overflow-hidden rounded-lg border">
          <ReactFlowProvider>
            <ReactFlow
              edges={edges}
              fitView
              maxZoom={1.5}
              minZoom={0.6}
              nodes={nodes}
              nodeTypes={automationNodeTypes}
              onConnect={onConnect}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onNodesChange={onNodesChange}
              onPaneClick={() => setSelectedNodeId(null)}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={20} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <AutomationConfigPanel
          node={selectedNode}
          onDeleteNode={handleDeleteNode}
          onUpdateNode={handleUpdateNode}
          templates={templates}
        />
      </div>
    </div>
  );
}
