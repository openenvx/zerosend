import type { ORPCError } from '@orpc/client';
import { OpenAPIHandler } from '@orpc/openapi/fetch';

import {
  evlogErrorInterceptor,
  type EvlogOrpcContext,
  wrapOrpcHandler,
} from '../logging/evlog';
import { v1Router } from '../routers/v1/index';
import {
  createPeekApiKeyRateLimiter,
  rateLimitResultToHeaders,
} from '../send/rate-limiter';
import type { V1Context } from '../v1-context';

function encodeV1ErrorBody(error: ORPCError<string, unknown>): unknown {
  if (error.data && typeof error.data === 'object') {
    if ('error' in error.data || 'code' in error.data) {
      return error.data;
    }
  }

  if (error.code === 'UNAUTHORIZED') {
    return { error: 'Unauthorized' };
  }

  if (error.code === 'FORBIDDEN') {
    return { error: 'Forbidden' };
  }

  if (error.code === 'BAD_REQUEST' || error.code === 'UNPROCESSABLE_CONTENT') {
    const issueMessage = getValidationMessage(error);
    return { error: issueMessage ?? 'Invalid request body' };
  }

  return { error: 'Internal Server Error' };
}

function getValidationMessage(
  error: ORPCError<string, unknown>
): string | null {
  if (!error.data || typeof error.data !== 'object') {
    return null;
  }

  if ('issues' in error.data && Array.isArray(error.data.issues)) {
    const firstIssue = error.data.issues[0];
    if (
      firstIssue &&
      typeof firstIssue === 'object' &&
      'message' in firstIssue &&
      typeof firstIssue.message === 'string'
    ) {
      return firstIssue.message;
    }
  }

  if ('message' in error.data && typeof error.data.message === 'string') {
    return error.data.message;
  }

  return null;
}

function applyRateLimitHeaders(
  response: Response,
  headers: HeadersInit | undefined
): Response {
  if (!headers) {
    return response;
  }

  const merged = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers)) {
    merged.set(key, String(value));
  }

  return new Response(response.body, {
    headers: merged,
    status: response.status,
    statusText: response.statusText,
  });
}

async function attachApiKeyRateLimitHeaders(
  context: V1Context,
  response: Response
): Promise<Response> {
  if (
    response.status === 401 ||
    !context.principal ||
    context.principal.kind !== 'api_key'
  ) {
    return response;
  }

  const peek = createPeekApiKeyRateLimiter(context.rateLimitKv, context.nowMs);
  const rateLimit = await peek.limit(context.principal.id);
  return applyRateLimitHeaders(response, rateLimitResultToHeaders(rateLimit));
}

function normalizeValidationStatus(response: Response): Response {
  if (response.status !== 422) {
    return response;
  }

  return new Response(response.body, {
    headers: response.headers,
    status: 400,
    statusText: response.statusText,
  });
}

export function createV1OpenAPIHandler(): OpenAPIHandler<
  V1Context & EvlogOrpcContext
> {
  const handler = new OpenAPIHandler(v1Router, {
    adapterInterceptors: [
      async (options) => {
        const result = await options.next();
        if (!result.matched) {
          return result;
        }

        let response = normalizeValidationStatus(result.response);
        response = await attachApiKeyRateLimitHeaders(
          options.context,
          response
        );

        return {
          matched: true,
          response,
        };
      },
    ],
    customErrorResponseBodyEncoder: encodeV1ErrorBody,
    interceptors: [evlogErrorInterceptor],
  });

  return wrapOrpcHandler(handler, { include: ['/v1/**'] });
}

export const v1OpenAPIHandler = createV1OpenAPIHandler();
