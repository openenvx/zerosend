import type { createDb } from '@zerosend/db';
import {
  automationEventIdempotency,
  automationRuns,
  automationStepRuns,
} from '@zerosend/db/schema';
import { and, eq, isNotNull, lte } from 'drizzle-orm';

import type { ApiKeyType } from '../auth/types';
import type { SendEmailBinding } from '../send/email-binding';
import {
  findPublishedAutomationsForEvent,
  resumeDelayStep,
  resumeWaitStep,
  startAutomationRun,
} from './executor';

type Db = ReturnType<typeof createDb>;

export interface IngestAutomationEventInput {
  email: string;
  event: string;
  idempotencyKey?: string | null;
  payload?: Record<string, unknown>;
}

export interface AutomationRuntimeOptions {
  emailBinding?: SendEmailBinding;
  keyType: ApiKeyType;
  nowMs: number;
}

export async function ingestAutomationEvent(
  db: Db,
  projectId: string,
  input: IngestAutomationEventInput,
  runtime: AutomationRuntimeOptions
) {
  if (input.idempotencyKey) {
    const [existing] = await db
      .select({ responseJson: automationEventIdempotency.responseJson })
      .from(automationEventIdempotency)
      .where(
        and(
          eq(automationEventIdempotency.projectId, projectId),
          eq(automationEventIdempotency.idempotencyKey, input.idempotencyKey)
        )
      )
      .limit(1);

    if (existing) {
      return JSON.parse(existing.responseJson) as {
        runIds: string[];
      };
    }
  }

  const payload = input.payload ?? {};
  const matchingAutomations = await findPublishedAutomationsForEvent(
    db,
    projectId,
    input.event
  );

  const runIds: string[] = [];

  for (const automation of matchingAutomations) {
    const result = await startAutomationRun(
      db,
      {
        automationId: automation.automationId,
        eventName: input.event,
        keyType: runtime.keyType,
        payload,
        projectId,
        recipientEmail: input.email,
      },
      runtime
    );
    runIds.push(result.runId);
  }

  await resumeWaitingEventSteps(db, {
    email: input.email,
    event: input.event,
    projectId,
    runtime,
  });

  const response = { runIds };

  if (input.idempotencyKey) {
    await db.insert(automationEventIdempotency).values({
      createdAt: new Date(),
      eventName: input.event,
      id: crypto.randomUUID(),
      idempotencyKey: input.idempotencyKey,
      projectId,
      recipientEmail: input.email,
      responseJson: JSON.stringify(response),
    });
  }

  return response;
}

async function resumeWaitingEventSteps(
  db: Db,
  input: {
    email: string;
    event: string;
    projectId: string;
    runtime: AutomationRuntimeOptions;
  }
) {
  const waitingSteps = await db
    .select({
      nodeId: automationStepRuns.nodeId,
      runId: automationStepRuns.runId,
      stepRunId: automationStepRuns.id,
      waitEvent: automationStepRuns.waitEvent,
    })
    .from(automationStepRuns)
    .innerJoin(automationRuns, eq(automationStepRuns.runId, automationRuns.id))
    .where(
      and(
        eq(automationRuns.projectId, input.projectId),
        eq(automationRuns.recipientEmail, input.email),
        eq(automationRuns.status, 'running'),
        eq(automationStepRuns.status, 'waiting'),
        isNotNull(automationStepRuns.waitEvent),
        eq(automationStepRuns.waitEvent, input.event),
        eq(automationRuns.currentNodeId, automationStepRuns.nodeId)
      )
    );

  for (const step of waitingSteps) {
    await resumeWaitStep(
      db,
      step.runId,
      step.stepRunId,
      step.nodeId,
      'received',
      input.runtime
    );
  }
}

export async function processDueAutomationSteps(
  db: Db,
  runtime: AutomationRuntimeOptions
) {
  const dueSteps = await db
    .select({
      nodeId: automationStepRuns.nodeId,
      resumeAtMs: automationStepRuns.resumeAtMs,
      runId: automationStepRuns.runId,
      stepRunId: automationStepRuns.id,
      waitEvent: automationStepRuns.waitEvent,
    })
    .from(automationStepRuns)
    .innerJoin(automationRuns, eq(automationStepRuns.runId, automationRuns.id))
    .where(
      and(
        eq(automationRuns.status, 'running'),
        eq(automationStepRuns.status, 'waiting'),
        isNotNull(automationStepRuns.resumeAtMs),
        lte(automationStepRuns.resumeAtMs, runtime.nowMs),
        eq(automationRuns.currentNodeId, automationStepRuns.nodeId)
      )
    );

  for (const step of dueSteps) {
    if (step.waitEvent) {
      await resumeWaitStep(
        db,
        step.runId,
        step.stepRunId,
        step.nodeId,
        'timeout',
        runtime
      );
      continue;
    }

    await resumeDelayStep(db, step.runId, step.stepRunId, step.nodeId, runtime);
  }
}
