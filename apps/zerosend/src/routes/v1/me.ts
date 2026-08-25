import { createFileRoute } from "@tanstack/react-router";
import { ApiKeyAdapter } from "@zerosend/api/auth";

export const Route = createFileRoute("/v1/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const adapter = new ApiKeyAdapter();
        const principal = await adapter.authenticate(request);

        if (!principal) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        return Response.json({
          kind: principal.kind,
          id: principal.id,
          scopes: principal.scopes,
        });
      },
    },
  },
});
