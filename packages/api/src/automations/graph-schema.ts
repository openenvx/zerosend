import { z } from 'zod';

export const automationNodeTypes = [
  'trigger',
  'sendEmail',
  'delay',
  'waitForEvent',
  'condition',
] as const;

export type AutomationNodeType = (typeof automationNodeTypes)[number];

export const delayUnits = ['minutes', 'hours', 'days', 'weeks'] as const;
export type DelayUnit = (typeof delayUnits)[number];

export const conditionOperators = [
  'equals',
  'not_equals',
  'contains',
  'exists',
] as const;

export type ConditionOperator = (typeof conditionOperators)[number];

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const triggerDataSchema = z.object({
  eventName: z.string().trim().min(1).max(120),
});

const sendEmailDataSchema = z.object({
  subject: z.string().trim().min(1).max(500).optional(),
  templateId: z.string().uuid(),
  variables: z.record(z.string(), z.string()).optional(),
});

const delayDataSchema = z.object({
  amount: z.number().int().min(1).max(365),
  unit: z.enum(delayUnits),
});

const waitForEventDataSchema = z.object({
  eventName: z.string().trim().min(1).max(120),
  timeoutAmount: z.number().int().min(1).max(365),
  timeoutUnit: z.enum(delayUnits),
});

const conditionDataSchema = z.object({
  field: z.string().trim().min(1).max(120),
  operator: z.enum(conditionOperators),
  value: z.string().max(500).optional(),
});

const baseNodeSchema = z.object({
  id: z.string().min(1).max(120),
  position: positionSchema,
  type: z.enum(automationNodeTypes),
});

export const automationNodeSchema = z.discriminatedUnion('type', [
  baseNodeSchema.extend({
    data: triggerDataSchema,
    type: z.literal('trigger'),
  }),
  baseNodeSchema.extend({
    data: sendEmailDataSchema,
    type: z.literal('sendEmail'),
  }),
  baseNodeSchema.extend({
    data: delayDataSchema,
    type: z.literal('delay'),
  }),
  baseNodeSchema.extend({
    data: waitForEventDataSchema,
    type: z.literal('waitForEvent'),
  }),
  baseNodeSchema.extend({
    data: conditionDataSchema,
    type: z.literal('condition'),
  }),
]);

export type AutomationNode = z.infer<typeof automationNodeSchema>;

export const automationEdgeSchema = z.object({
  id: z.string().min(1).max(120),
  source: z.string().min(1).max(120),
  sourceHandle: z
    .enum(['default', 'true', 'false', 'received', 'timeout'])
    .optional(),
  target: z.string().min(1).max(120),
});

export type AutomationEdge = z.infer<typeof automationEdgeSchema>;

export const automationGraphSchema = z.object({
  edges: z.array(automationEdgeSchema).max(100),
  nodes: z.array(automationNodeSchema).min(1).max(50),
});

export type AutomationGraph = z.infer<typeof automationGraphSchema>;

export const MAX_GRAPH_JSON_LENGTH = 500_000;

export function parseAutomationGraph(json: string): AutomationGraph {
  const parsed: unknown = JSON.parse(json);
  return automationGraphSchema.parse(parsed);
}

export function serializeAutomationGraph(graph: AutomationGraph): string {
  return JSON.stringify(graph);
}

export function delayToMilliseconds(amount: number, unit: DelayUnit): number {
  const minuteMs = 60_000;
  switch (unit) {
    case 'minutes': {
      return amount * minuteMs;
    }
    case 'hours': {
      return amount * 60 * minuteMs;
    }
    case 'days': {
      return amount * 24 * 60 * minuteMs;
    }
    case 'weeks': {
      return amount * 7 * 24 * 60 * minuteMs;
    }
    default: {
      return amount * minuteMs;
    }
  }
}

export function getNodeById(
  graph: AutomationGraph,
  nodeId: string
): AutomationNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getOutgoingEdges(
  graph: AutomationGraph,
  nodeId: string,
  sourceHandle?: AutomationEdge['sourceHandle']
): AutomationEdge[] {
  return graph.edges.filter((edge) => {
    if (edge.source !== nodeId) {
      return false;
    }

    if (sourceHandle === undefined) {
      return edge.sourceHandle === undefined || edge.sourceHandle === 'default';
    }

    return edge.sourceHandle === sourceHandle;
  });
}

export function getTriggerNode(
  graph: AutomationGraph
): AutomationNode & { type: 'trigger' } {
  const triggers = graph.nodes.filter((node) => node.type === 'trigger');
  if (triggers.length !== 1) {
    throw new Error('Graph must contain exactly one trigger node');
  }

  const trigger = triggers[0];
  if (!trigger || trigger.type !== 'trigger') {
    throw new Error('Invalid trigger node');
  }

  return trigger;
}

export function getPublishedTriggerEvent(graph: AutomationGraph): string {
  return getTriggerNode(graph).data.eventName;
}
