import { describe, expect, it } from 'vitest';

import { delayToMilliseconds, parseAutomationGraph } from './graph-schema';
import { validateAutomationGraph } from './validate-graph';

const validGraphJson = JSON.stringify({
  edges: [{ id: 'e1', source: 'trigger', target: 'send' }],
  nodes: [
    {
      data: { eventName: 'user.signup' },
      id: 'trigger',
      position: { x: 0, y: 0 },
      type: 'trigger',
    },
    {
      data: {
        subject: 'Welcome',
        templateId: '00000000-0000-4000-8000-000000000001',
      },
      id: 'send',
      position: { x: 200, y: 0 },
      type: 'sendEmail',
    },
  ],
});

describe('automation graph validation', () => {
  it('accepts a minimal publishable graph', () => {
    const graph = parseAutomationGraph(validGraphJson);
    const result = validateAutomationGraph(graph, { forPublish: true });
    expect(result.valid).toBe(true);
  });

  it('rejects graphs without a trigger', () => {
    const graph = parseAutomationGraph(
      JSON.stringify({
        edges: [],
        nodes: [
          {
            data: {
              amount: 1,
              unit: 'hours',
            },
            id: 'delay',
            position: { x: 0, y: 0 },
            type: 'delay',
          },
        ],
      })
    );

    const result = validateAutomationGraph(graph, { forPublish: true });
    expect(result.valid).toBe(false);
    expect(result.issues[0]?.message).toContain('trigger');
  });

  it('requires wait-for-event branches when publishing', () => {
    const graph = parseAutomationGraph(
      JSON.stringify({
        edges: [{ id: 'e1', source: 'trigger', target: 'wait' }],
        nodes: [
          {
            data: { eventName: 'order.created' },
            id: 'trigger',
            position: { x: 0, y: 0 },
            type: 'trigger',
          },
          {
            data: {
              eventName: 'order.completed',
              timeoutAmount: 2,
              timeoutUnit: 'hours',
            },
            id: 'wait',
            position: { x: 200, y: 0 },
            type: 'waitForEvent',
          },
        ],
      })
    );

    const result = validateAutomationGraph(graph, { forPublish: true });
    expect(result.valid).toBe(false);
    expect(
      result.issues.some((issue) =>
        issue.message.includes('received and timeout')
      )
    ).toBe(true);
  });
});

describe('delayToMilliseconds', () => {
  it('converts hours to milliseconds', () => {
    expect(delayToMilliseconds(2, 'hours')).toBe(7_200_000);
  });
});
