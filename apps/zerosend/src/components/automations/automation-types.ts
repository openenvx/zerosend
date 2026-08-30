import type { AutomationNodeType } from '@zerosend/api/automations/graph-schema';

export interface AutomationBuilderGraph {
  edges: {
    id: string;
    source: string;
    sourceHandle?: 'default' | 'true' | 'false' | 'received' | 'timeout';
    target: string;
  }[];
  nodes: {
    data: Record<string, unknown>;
    id: string;
    position: { x: number; y: number };
    type: AutomationNodeType;
  }[];
}

export const nodePalette: {
  description: string;
  label: string;
  type: AutomationNodeType;
}[] = [
  {
    description: 'Start when a custom event is received',
    label: 'Custom event',
    type: 'trigger',
  },
  {
    description: 'Send a published template email',
    label: 'Send email',
    type: 'sendEmail',
  },
  {
    description: 'Pause for minutes, hours, days, or weeks',
    label: 'Time delay',
    type: 'delay',
  },
  {
    description: 'Wait until an event occurs or times out',
    label: 'Wait for event',
    type: 'waitForEvent',
  },
  {
    description: 'Branch based on event payload data',
    label: 'Conditional path',
    type: 'condition',
  },
];

export function createDefaultNodeData(
  type: AutomationNodeType
): Record<string, unknown> {
  switch (type) {
    case 'trigger': {
      return { eventName: 'user.signup' };
    }
    case 'sendEmail': {
      return {
        subject: 'Automation email',
        templateId: '',
      };
    }
    case 'delay': {
      return { amount: 10, unit: 'minutes' };
    }
    case 'waitForEvent': {
      return {
        eventName: 'user.completed',
        timeoutAmount: 2,
        timeoutUnit: 'hours',
      };
    }
    case 'condition': {
      return {
        field: 'plan',
        operator: 'equals',
        value: 'pro',
      };
    }
    default: {
      return {};
    }
  }
}

export function createNodeId(type: AutomationNodeType): string {
  return `${type}-${crypto.randomUUID().slice(0, 8)}`;
}
