import { createFileRoute } from '@tanstack/react-router';
import { createV1Context } from '@zerosend/api/v1-context';
import { v1OpenAPIHandler } from '@zerosend/api/v1/handler';

async function handle({ request }: { request: Request }) {
  const result = await v1OpenAPIHandler.handle(request, {
    context: await createV1Context({ req: request }),
    prefix: '/v1',
  });

  if (result.matched) {
    return result.response;
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}

export const Route = createFileRoute('/v1/$')({
  server: {
    handlers: {
      DELETE: handle,
      GET: handle,
      HEAD: handle,
      PATCH: handle,
      POST: handle,
      PUT: handle,
    },
  },
});
