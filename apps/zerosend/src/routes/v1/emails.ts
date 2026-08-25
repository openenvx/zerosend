import { createFileRoute } from '@tanstack/react-router';
import { handlePostEmails } from '@zerosend/api/send/handle-post-emails';

export const Route = createFileRoute('/v1/emails')({
  server: {
    handlers: {
      POST: async ({ request }) => handlePostEmails(request),
    },
  },
});
