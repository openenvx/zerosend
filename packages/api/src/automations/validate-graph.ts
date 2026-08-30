import type {
  AutomationEdge,
  AutomationGraph,
  AutomationNode,
} from './graph-schema';
import { getOutgoingEdges, getTriggerNode } from './graph-schema';

export interface GraphValidationIssue {
  message: string;
  nodeId?: string;
}

export interface GraphValidationResult {
  issues: GraphValidationIssue[];
  valid: boolean;
}

function addIssue(
  issues: GraphValidationIssue[],
  message: string,
  nodeId?: string
) {
  issues.push({ message, nodeId });
}

function validateNodeConfiguration(
  node: AutomationNode,
  issues: GraphValidationIssue[]
) {
  if (node.type === 'sendEmail' && !node.data.templateId) {
    addIssue(issues, 'Send email step requires a template', node.id);
  }

  if (node.type === 'condition' && node.data.operator !== 'exists') {
    if (!node.data.value || node.data.value.trim().length === 0) {
      addIssue(issues, 'Condition step requires a comparison value', node.id);
    }
  }
}

function validateOutgoingEdges(
  graph: AutomationGraph,
  node: AutomationNode,
  issues: GraphValidationIssue[]
) {
  const defaultEdges = getOutgoingEdges(graph, node.id);
  const trueEdges = getOutgoingEdges(graph, node.id, 'true');
  const falseEdges = getOutgoingEdges(graph, node.id, 'false');
  const receivedEdges = getOutgoingEdges(graph, node.id, 'received');
  const timeoutEdges = getOutgoingEdges(graph, node.id, 'timeout');

  if (node.type === 'condition') {
    if (trueEdges.length !== 1 || falseEdges.length !== 1) {
      addIssue(
        issues,
        'Condition step must have exactly one true and one false branch',
        node.id
      );
    }
    return;
  }

  if (node.type === 'waitForEvent') {
    if (receivedEdges.length !== 1 || timeoutEdges.length !== 1) {
      addIssue(
        issues,
        'Wait for event step must have received and timeout branches',
        node.id
      );
    }
    return;
  }

  if (node.type === 'sendEmail') {
    if (defaultEdges.length > 1) {
      addIssue(
        issues,
        'Send email step can only have one outgoing connection',
        node.id
      );
    }
    return;
  }

  if (defaultEdges.length === 0) {
    addIssue(issues, 'Step must connect to a next step', node.id);
  }

  if (defaultEdges.length > 1) {
    addIssue(
      issues,
      'Step can only have one default outgoing connection',
      node.id
    );
  }
}

function detectCycle(graph: AutomationGraph): string | null {
  const adjacency = new Map<string, string[]>();

  for (const edge of graph.edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(nodeId: string): string | null {
    if (visiting.has(nodeId)) {
      return nodeId;
    }

    if (visited.has(nodeId)) {
      return null;
    }

    visiting.add(nodeId);
    for (const next of adjacency.get(nodeId) ?? []) {
      const cycle = visit(next);
      if (cycle) {
        return cycle;
      }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return null;
  }

  for (const node of graph.nodes) {
    const cycle = visit(node.id);
    if (cycle) {
      return cycle;
    }
  }

  return null;
}

function validateReachability(
  graph: AutomationGraph,
  issues: GraphValidationIssue[]
) {
  let trigger;
  try {
    trigger = getTriggerNode(graph);
  } catch {
    return;
  }

  const reachable = new Set<string>();
  const queue = [trigger.id];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (!nodeId || reachable.has(nodeId)) {
      continue;
    }

    reachable.add(nodeId);
    const outgoing = graph.edges.filter((edge) => edge.source === nodeId);
    for (const edge of outgoing) {
      queue.push(edge.target);
    }
  }

  for (const node of graph.nodes) {
    if (!reachable.has(node.id)) {
      addIssue(issues, 'Step is not reachable from the trigger', node.id);
    }
  }
}

function validateEdgeEndpoints(
  graph: AutomationGraph,
  issues: GraphValidationIssue[]
) {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) {
      addIssue(issues, `Edge references missing source node ${edge.source}`);
    }

    if (!nodeIds.has(edge.target)) {
      addIssue(issues, `Edge references missing target node ${edge.target}`);
    }
  }
}

export function validateAutomationGraph(
  graph: AutomationGraph,
  options: { forPublish: boolean }
): GraphValidationResult {
  const issues: GraphValidationIssue[] = [];

  validateEdgeEndpoints(graph, issues);

  try {
    getTriggerNode(graph);
  } catch (error) {
    addIssue(
      issues,
      error instanceof Error ? error.message : 'Invalid trigger configuration'
    );
  }

  for (const node of graph.nodes) {
    validateNodeConfiguration(node, issues);
    if (options.forPublish) {
      validateOutgoingEdges(graph, node, issues);
    }
  }

  if (options.forPublish) {
    validateReachability(graph, issues);
    const cycleNodeId = detectCycle(graph);
    if (cycleNodeId) {
      addIssue(issues, 'Workflow graph cannot contain cycles', cycleNodeId);
    }
  }

  return {
    issues,
    valid: issues.length === 0,
  };
}

export function pickNextEdge(
  edges: AutomationEdge[],
  preferredHandle?: AutomationEdge['sourceHandle']
): AutomationEdge | null {
  if (edges.length === 0) {
    return null;
  }

  if (preferredHandle) {
    const match = edges.find((edge) => edge.sourceHandle === preferredHandle);
    if (match) {
      return match;
    }
  }

  const defaultEdge = edges.find(
    (edge) => edge.sourceHandle === undefined || edge.sourceHandle === 'default'
  );
  return defaultEdge ?? edges[0] ?? null;
}
