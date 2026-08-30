import { createFileRoute } from '@tanstack/react-router';
import { processAutomationCron } from '@zerosend/api/automations/process-cron';

export const Route = createFileRoute('/api/cron/automations')({
  server: {
    handlers: {
      POST: async ({ request }) => processAutomationCron(request),
    },
  },
});
