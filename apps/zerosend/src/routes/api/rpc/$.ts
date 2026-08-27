import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { createFileRoute } from '@tanstack/react-router';
import { appRpcHandler } from '@zerosend/api/app-handlers';
import { createContext } from '@zerosend/api/context';
import {
  evlogErrorInterceptor,
  wrapOrpcHandler,
} from '@zerosend/api/logging/evlog';
import { appRouter } from '@zerosend/api/routers/index';

const appOpenAPIHandler = wrapOrpcHandler(
  new OpenAPIHandler(appRouter, {
    interceptors: [evlogErrorInterceptor],
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
      }),
    ],
  }),
  { include: ['/api/rpc/api-reference/**'] }
);

async function handle({ request }: { request: Request }) {
  const rpcResult = await appRpcHandler.handle(request, {
    context: await createContext({ req: request }),
    prefix: '/api/rpc',
  });
  if (rpcResult.response) {
    return rpcResult.response;
  }

  const apiResult = await appOpenAPIHandler.handle(request, {
    context: await createContext({ req: request }),
    prefix: '/api/rpc/api-reference',
  });
  if (apiResult.response) {
    return apiResult.response;
  }

  return new Response('Not found', { status: 404 });
}

export const Route = createFileRoute('/api/rpc/$')({
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
