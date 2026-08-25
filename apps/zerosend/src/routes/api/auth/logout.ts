import { createFileRoute } from "@tanstack/react-router";

import { logoutSession } from "@/lib/auth-actions.server";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => logoutSession(),
    },
  },
});
