import type { createDb } from '@zerosend/db';
import {
  automationRuns,
  automationStepRuns,
  automations,
} from '@zerosend/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

import type { ApiKeyType } from '../auth/types';
import { apiLogger } from '../logging/evlog';
import type { SendEmailBinding } from '../send/email-binding';
import { sendEmail } from '../send/send-email';
import {
  delayToMilliseconds,
  getNodeById,
  getOutgoingEdges,
  getTriggerNode,
  parseAutomationGraph,
  type AutomationGraph,
  type AutomationNode,
} from './graph-schema';
import { pickNextEdge } from './validate-graph';

type Db = ReturnType<typeof createDb>;

export interface AutomationExecutionContext {
  db: Db;
  emailBinding?: SendEmailBinding;
  keyType: ApiKeyType;
  nowMs: number;
  projectId: string;
  recipientEmail: string;
  runPayload: Record<string, unknown>;
}

interface RunRecord {
  automationId: string;
  currentNodeId: string | null;
  graph: AutomationGraph;
  id: string;
  projectId: string;
  recipientEmail: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  triggerEvent: string;
}

function interpolateVariables(
  variables: Record<string, string> | undefined,
  payload: Record<string, unknown>
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(variables ?? {})) {
    if (value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      const payloadValue = getPayloadValue(payload, path);
      resolved[key] = payloadValue === undefined ? '' : String(payloadValue);
      continue;
    }

    resolved[key] = value;
  }

  return resolved;
}

function getPayloadValue(
  payload: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split('.');
  let current: unknown = payload;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function evaluateCondition(
  node: AutomationNode & { type: 'condition' },
  payload: Record<string, unknown>
): boolean {
  const value = getPayloadValue(payload, node.data.field);

  switch (node.data.operator) {
    case 'exists': {
      return value !== undefined && value !== null && value !== '';
    }
    case 'equals': {
      return String(value ?? '') === (node.data.value ?? '');
    }
    case 'not_equals': {
      return String(value ?? '') !== (node.data.value ?? '');
    }
    case 'contains': {
      return String(value ?? '').includes(node.data.value ?? '');
    }
    default: {
      return false;
    }
  }
}

async function createStepRun(
  db: Db,
  input: {
    branch?: string | null;
    node: AutomationNode;
    resumeAtMs?: number | null;
    runId: string;
    status: 'pending' | 'running' | 'waiting';
    waitEvent?: string | null;
  }
) {
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(automationStepRuns).values({
    branch: input.branch ?? null,
    createdAt: now,
    error: null,
    id,
    inputJson: null,
    nodeId: input.node.id,
    nodeType: input.node.type,
    outputJson: null,
    resumeAtMs: input.resumeAtMs ?? null,
    runId: input.runId,
    startedAt: input.status === 'running' ? now : null,
    status: input.status,
    waitEvent: input.waitEvent ?? null,
  });

  return id;
}

async function completeStepRun(
  db: Db,
  stepRunId: string,
  input: {
    error?: string | null;
    output?: Record<string, unknown> | null;
    status: 'completed' | 'failed' | 'skipped';
  }
) {
  await db
    .update(automationStepRuns)
    .set({
      completedAt: new Date(),
      error: input.error ?? null,
      outputJson: input.output ? JSON.stringify(input.output) : null,
      status: input.status,
    })
    .where(eq(automationStepRuns.id, stepRunId));
}

async function updateRun(
  db: Db,
  runId: string,
  input: {
    currentNodeId?: string | null;
    status?: RunRecord['status'];
  }
) {
  const now = new Date();
  await db
    .update(automationRuns)
    .set({
      completedAt:
        input.status === 'completed' ||
        input.status === 'failed' ||
        input.status === 'cancelled'
          ? now
          : undefined,
      currentNodeId: input.currentNodeId,
      status: input.status,
      updatedAt: now,
    })
    .where(eq(automationRuns.id, runId));
}

async function loadRun(db: Db, runId: string): Promise<RunRecord | null> {
  const [run] = await db
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.id, runId))
    .limit(1);

  if (!run?.graphJson) {
    return null;
  }

  return {
    automationId: run.automationId,
    currentNodeId: run.currentNodeId,
    graph: parseAutomationGraph(run.graphJson),
    id: run.id,
    projectId: run.projectId,
    recipientEmail: run.recipientEmail,
    status: run.status,
    triggerEvent: run.triggerEvent,
  };
}

async function executeNode(
  run: RunRecord,
  node: AutomationNode,
  context: AutomationExecutionContext
): Promise<{
  pause: boolean;
  preferredHandle?: 'true' | 'false' | 'received' | 'timeout';
}> {
  const stepRunId = await createStepRun(context.db, {
    node,
    runId: run.id,
    status: 'running',
  });

  try {
    switch (node.type) {
      case 'trigger': {
        await completeStepRun(context.db, stepRunId, {
          output: { event: run.triggerEvent },
          status: 'completed',
        });
        return { pause: false };
      }
      case 'sendEmail': {
        const subject =
          node.data.subject ??
          `Automation email (${node.data.templateId.slice(0, 8)})`;
        const result = await sendEmail(
          context.db,
          {
            subject,
            template: {
              id: node.data.templateId,
              variables: interpolateVariables(
                node.data.variables,
                context.runPayload
              ),
            },
            to: [context.recipientEmail],
          },
          {
            keyId: `automation:${run.id}`,
            keyPrefix: 'auto',
            keyType: context.keyType,
            projectId: context.projectId,
          },
          { emailBinding: context.emailBinding }
        );

        await completeStepRun(context.db, stepRunId, {
          output: {
            email_id: result.id,
            template_id: node.data.templateId,
            to: [context.recipientEmail],
          },
          status: 'completed',
        });
        return { pause: false };
      }
      case 'delay': {
        const resumeAtMs =
          context.nowMs + delayToMilliseconds(node.data.amount, node.data.unit);
        await context.db
          .update(automationStepRuns)
          .set({
            resumeAtMs,
            status: 'waiting',
          })
          .where(eq(automationStepRuns.id, stepRunId));
        await updateRun(context.db, run.id, { currentNodeId: node.id });
        return { pause: true };
      }
      case 'waitForEvent': {
        const resumeAtMs =
          context.nowMs +
          delayToMilliseconds(node.data.timeoutAmount, node.data.timeoutUnit);
        await context.db
          .update(automationStepRuns)
          .set({
            resumeAtMs,
            status: 'waiting',
            waitEvent: node.data.eventName,
          })
          .where(eq(automationStepRuns.id, stepRunId));
        await updateRun(context.db, run.id, { currentNodeId: node.id });
        return { pause: true };
      }
      case 'condition': {
        const result = evaluateCondition(node, context.runPayload);
        await completeStepRun(context.db, stepRunId, {
          output: { result },
          status: 'completed',
        });
        return {
          pause: false,
          preferredHandle: result ? 'true' : 'false',
        };
      }
      default: {
        throw new Error('Unsupported node type');
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Step failed';
    await completeStepRun(context.db, stepRunId, {
      error: message,
      status: 'failed',
    });
    await updateRun(context.db, run.id, {
      currentNodeId: node.id,
      status: 'failed',
    });
    throw error;
  }
}

async function continueFromNode(
  run: RunRecord,
  nodeId: string,
  context: AutomationExecutionContext
) {
  let currentNodeId: string | null = nodeId;

  while (currentNodeId) {
    const node = getNodeById(run.graph, currentNodeId);
    if (!node) {
      await updateRun(context.db, run.id, { status: 'failed' });
      throw new Error(`Missing node ${currentNodeId}`);
    }

    const result = await executeNode(run, node, context);
    if (result.pause) {
      return;
    }

    const nextEdge = result.preferredHandle
      ? pickNextEdge(
          getOutgoingEdges(run.graph, node.id, result.preferredHandle),
          result.preferredHandle
        )
      : pickNextEdge(getOutgoingEdges(run.graph, node.id));

    if (!nextEdge) {
      await updateRun(context.db, run.id, {
        currentNodeId: null,
        status: 'completed',
      });
      return;
    }

    currentNodeId = nextEdge.target;
    await updateRun(context.db, run.id, { currentNodeId });
  }
}

export async function startAutomationRun(
  db: Db,
  input: {
    automationId: string;
    eventName: string;
    keyType: ApiKeyType;
    payload: Record<string, unknown>;
    projectId: string;
    recipientEmail: string;
  },
  execution: Omit<
    AutomationExecutionContext,
    'db' | 'projectId' | 'recipientEmail' | 'runPayload'
  >
): Promise<{ runId: string }> {
  const [automation] = await db
    .select()
    .from(automations)
    .where(
      and(
        eq(automations.id, input.automationId),
        eq(automations.projectId, input.projectId)
      )
    )
    .limit(1);

  if (!automation?.publishedGraphJson || automation.publishedAt === null) {
    throw new Error('Automation is not published');
  }

  const graph = parseAutomationGraph(automation.publishedGraphJson);
  const trigger = getTriggerNode(graph);
  if (trigger.data.eventName !== input.eventName) {
    throw new Error('Event does not match automation trigger');
  }

  const runId = crypto.randomUUID();
  const now = new Date();

  await db.insert(automationRuns).values({
    automationId: input.automationId,
    completedAt: null,
    createdAt: now,
    currentNodeId: trigger.id,
    graphJson: automation.publishedGraphJson,
    id: runId,
    projectId: input.projectId,
    recipientEmail: input.recipientEmail,
    status: 'running',
    triggerEvent: input.eventName,
    triggerPayloadJson: JSON.stringify(input.payload),
    updatedAt: now,
  });

  const run: RunRecord = {
    automationId: input.automationId,
    currentNodeId: trigger.id,
    graph,
    id: runId,
    projectId: input.projectId,
    recipientEmail: input.recipientEmail,
    status: 'running',
    triggerEvent: input.eventName,
  };

  const context: AutomationExecutionContext = {
    db,
    emailBinding: execution.emailBinding,
    keyType: execution.keyType,
    nowMs: execution.nowMs,
    projectId: input.projectId,
    recipientEmail: input.recipientEmail,
    runPayload: input.payload,
  };

  apiLogger.info('automation_run_started', {
    automationId: input.automationId,
    eventName: input.eventName,
    projectId: input.projectId,
    runId,
  });

  await continueFromNode(run, trigger.id, context);

  return { runId };
}

export async function resumeDelayStep(
  db: Db,
  runId: string,
  stepRunId: string,
  nodeId: string,
  execution: Omit<
    AutomationExecutionContext,
    'db' | 'projectId' | 'recipientEmail' | 'runPayload'
  >
) {
  const run = await loadRun(db, runId);
  if (!run || run.status !== 'running' || run.currentNodeId !== nodeId) {
    return;
  }

  await completeStepRun(db, stepRunId, {
    output: { resumed: true },
    status: 'completed',
  });

  const outgoing = getOutgoingEdges(run.graph, nodeId);
  const nextEdge = pickNextEdge(outgoing);
  if (!nextEdge) {
    await updateRun(db, run.id, { currentNodeId: null, status: 'completed' });
    return;
  }

  const [runRow] = await db
    .select({ triggerPayloadJson: automationRuns.triggerPayloadJson })
    .from(automationRuns)
    .where(eq(automationRuns.id, runId))
    .limit(1);

  const context: AutomationExecutionContext = {
    db,
    emailBinding: execution.emailBinding,
    keyType: execution.keyType,
    nowMs: execution.nowMs,
    projectId: run.projectId,
    recipientEmail: run.recipientEmail,
    runPayload: JSON.parse(runRow?.triggerPayloadJson ?? '{}') as Record<
      string,
      unknown
    >,
  };

  await continueFromNode(run, nextEdge.target, context);
}

export async function resumeWaitStep(
  db: Db,
  runId: string,
  stepRunId: string,
  nodeId: string,
  branch: 'received' | 'timeout',
  execution: Omit<
    AutomationExecutionContext,
    'db' | 'projectId' | 'recipientEmail' | 'runPayload'
  >
) {
  const run = await loadRun(db, runId);
  if (!run || run.status !== 'running' || run.currentNodeId !== nodeId) {
    return;
  }

  await completeStepRun(db, stepRunId, {
    output: { branch },
    status: branch === 'timeout' ? 'skipped' : 'completed',
  });

  const outgoing = getOutgoingEdges(run.graph, nodeId, branch);
  const nextEdge = pickNextEdge(outgoing, branch);
  if (!nextEdge) {
    await updateRun(db, run.id, { currentNodeId: null, status: 'completed' });
    return;
  }

  const [runRow] = await db
    .select({ triggerPayloadJson: automationRuns.triggerPayloadJson })
    .from(automationRuns)
    .where(eq(automationRuns.id, runId))
    .limit(1);

  const context: AutomationExecutionContext = {
    db,
    emailBinding: execution.emailBinding,
    keyType: execution.keyType,
    nowMs: execution.nowMs,
    projectId: run.projectId,
    recipientEmail: run.recipientEmail,
    runPayload: JSON.parse(runRow?.triggerPayloadJson ?? '{}') as Record<
      string,
      unknown
    >,
  };

  await continueFromNode(run, nextEdge.target, context);
}

export async function findPublishedAutomationsForEvent(
  db: Db,
  projectId: string,
  eventName: string
) {
  const rows = await db
    .select({
      id: automations.id,
      publishedGraphJson: automations.publishedGraphJson,
    })
    .from(automations)
    .where(
      and(
        eq(automations.projectId, projectId),
        isNotNull(automations.publishedAt),
        isNotNull(automations.publishedGraphJson)
      )
    );

  return rows
    .map((row) => {
      try {
        const graph = parseAutomationGraph(row.publishedGraphJson!);
        const trigger = getTriggerNode(graph);
        if (trigger.data.eventName !== eventName) {
          return null;
        }

        return { automationId: row.id, graph };
      } catch {
        return null;
      }
    })
    .filter((row): row is { automationId: string; graph: AutomationGraph } =>
      Boolean(row)
    );
}
