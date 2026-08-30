import type { AutomationGraph } from './graph-schema';

export interface AutomationStarterTemplate {
  description: string;
  graph: AutomationGraph;
  id: string;
  name: string;
}

export function createStarterTemplates(): AutomationStarterTemplate[] {
  return [
    {
      description:
        'Send a welcome email shortly after a user signs up with a custom event.',
      graph: {
        edges: [
          {
            id: 'e-trigger-delay',
            source: 'trigger',
            target: 'delay',
          },
          {
            id: 'e-delay-send',
            source: 'delay',
            target: 'send-welcome',
          },
        ],
        nodes: [
          {
            data: { eventName: 'user.signup' },
            id: 'trigger',
            position: { x: 0, y: 120 },
            type: 'trigger',
          },
          {
            data: { amount: 10, unit: 'minutes' },
            id: 'delay',
            position: { x: 280, y: 120 },
            type: 'delay',
          },
          {
            data: {
              subject: 'Welcome to ZeroSend',
              templateId: '00000000-0000-4000-8000-000000000099',
            },
            id: 'send-welcome',
            position: { x: 560, y: 120 },
            type: 'sendEmail',
          },
        ],
      },
      id: 'welcome-users',
      name: 'Welcome users',
    },
    {
      description:
        'Wait for a completion event after order creation, then send a coupon email.',
      graph: {
        edges: [
          {
            id: 'e-trigger-wait',
            source: 'trigger',
            target: 'wait-complete',
          },
          {
            id: 'e-wait-received-send',
            source: 'wait-complete',
            sourceHandle: 'received',
            target: 'send-coupon',
          },
          {
            id: 'e-wait-timeout-send',
            source: 'wait-complete',
            sourceHandle: 'timeout',
            target: 'send-abandoned',
          },
        ],
        nodes: [
          {
            data: { eventName: 'order.created' },
            id: 'trigger',
            position: { x: 0, y: 140 },
            type: 'trigger',
          },
          {
            data: {
              eventName: 'order.completed',
              timeoutAmount: 2,
              timeoutUnit: 'hours',
            },
            id: 'wait-complete',
            position: { x: 280, y: 140 },
            type: 'waitForEvent',
          },
          {
            data: {
              subject: 'Thanks for completing your order',
              templateId: '00000000-0000-4000-8000-000000000099',
            },
            id: 'send-coupon',
            position: { x: 600, y: 60 },
            type: 'sendEmail',
          },
          {
            data: {
              subject: 'Still thinking about your order?',
              templateId: '00000000-0000-4000-8000-000000000099',
            },
            id: 'send-abandoned',
            position: { x: 600, y: 220 },
            type: 'sendEmail',
          },
        ],
      },
      id: 'abandoned-cart',
      name: 'Abandoned cart',
    },
    {
      description:
        'Send a short drip sequence with a delay between onboarding emails.',
      graph: {
        edges: [
          {
            id: 'e-trigger-delay',
            source: 'trigger',
            target: 'delay-1',
          },
          {
            id: 'e-delay-send-1',
            source: 'delay-1',
            target: 'send-1',
          },
          {
            id: 'e-send-1-delay-2',
            source: 'send-1',
            target: 'delay-2',
          },
          {
            id: 'e-delay-2-send-2',
            source: 'delay-2',
            target: 'send-2',
          },
        ],
        nodes: [
          {
            data: { eventName: 'user.signup' },
            id: 'trigger',
            position: { x: 0, y: 120 },
            type: 'trigger',
          },
          {
            data: { amount: 1, unit: 'days' },
            id: 'delay-1',
            position: { x: 260, y: 120 },
            type: 'delay',
          },
          {
            data: {
              subject: 'Getting started',
              templateId: '00000000-0000-4000-8000-000000000099',
            },
            id: 'send-1',
            position: { x: 520, y: 120 },
            type: 'sendEmail',
          },
          {
            data: { amount: 3, unit: 'days' },
            id: 'delay-2',
            position: { x: 780, y: 120 },
            type: 'delay',
          },
          {
            data: {
              subject: 'Tips for your second week',
              templateId: '00000000-0000-4000-8000-000000000099',
            },
            id: 'send-2',
            position: { x: 1040, y: 120 },
            type: 'sendEmail',
          },
        ],
      },
      id: 'drip-campaign',
      name: 'Drip campaign',
    },
  ];
}

export function getStarterTemplate(
  templateId: string
): AutomationStarterTemplate | undefined {
  return createStarterTemplates().find(
    (template) => template.id === templateId
  );
}
