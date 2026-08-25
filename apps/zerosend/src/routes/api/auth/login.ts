import { createFileRoute } from '@tanstack/react-router';

import { loginWithToken } from '@/lib/auth-actions.server';

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { token?: string };
        if (!body.token) {
          return Response.json(
            { error: 'Token is required', ok: false },
            { status: 400 }
          );
        }

        return loginWithToken(body.token);
      },
    },
  },
});
