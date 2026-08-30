import { createDb } from '@zerosend/db';
import { env } from '@zerosend/env/server';

import { processDueAutomationSteps } from './ingest-event';

export async function processAutomationCron(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createDb();
  await processDueAutomationSteps(db, {
    emailBinding: env.EMAIL,
    keyType: 'live',
    nowMs: Date.now(),
  });

  return Response.json({ ok: true });
}
