import { ORPCError } from '@orpc/server';
import { z } from 'zod';

import type { ApiKeyPrincipal } from '../../auth/types';
import type { EvlogOrpcContext } from '../../logging/evlog';
import {
  completeIdempotency,
  hashSendRequestBody,
  IDEMPOTENCY_KEY_MAX_LENGTH,
  lookupIdempotency,
  reserveIdempotency,
  type IdempotencyLookupResult,
} from '../../send/idempotency';
import { createConsumeApiKeyRateLimiter } from '../../send/rate-limiter';
import {
  MissingFromAddressError,
  sendEmail,
  SendEmailDeliveryError,
  sendEmailInputSchema,
  TemplateNotFoundError,
  TemplateNotPublishedError,
  UnverifiedFromDomainError,
  type SendEmailInput,
} from '../../send/send-email';
import {
  SEND_EMAIL_TIMEOUT_MS,
  SendEmailTimeoutError,
  withTimeout,
} from '../../send/with-timeout';
import type { V1Context } from '../../v1-context';
import { apiKeyProcedure, sendScopeProcedure } from '../../v1-procedures';

type V1ErrorCode =
  | 'BAD_REQUEST'
  | 'BAD_GATEWAY'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TOO_MANY_REQUESTS';

function mapHttpStatusToErrorCode(status: number): V1ErrorCode {
  if (status === 400) {
    return 'BAD_REQUEST';
  }

  if (status === 403) {
    return 'FORBIDDEN';
  }

  if (status === 409) {
    return 'CONFLICT';
  }

  if (status === 429) {
    return 'TOO_MANY_REQUESTS';
  }

  if (status === 502 || status === 504) {
    return 'BAD_GATEWAY';
  }

  if (status === 503) {
    return 'SERVICE_UNAVAILABLE';
  }

  return 'INTERNAL_SERVER_ERROR';
}

function throwV1Error(status: number, body: Record<string, unknown>): never {
  const message =
    typeof body.error === 'string' ? body.error : 'Request failed';

  throw new ORPCError(mapHttpStatusToErrorCode(status), {
    data: body,
    message,
  });
}

function mapSendError(error: unknown): {
  body: Record<string, unknown>;
  status: number;
} {
  if (error instanceof MissingFromAddressError) {
    return { body: { error: error.message }, status: 400 };
  }

  if (error instanceof UnverifiedFromDomainError) {
    return { body: { error: error.message }, status: 400 };
  }

  if (error instanceof TemplateNotFoundError) {
    return { body: { error: error.message }, status: 404 };
  }

  if (error instanceof TemplateNotPublishedError) {
    return { body: { error: error.message }, status: 400 };
  }

  if (error instanceof SendEmailDeliveryError) {
    return {
      body: {
        code: error.code,
        error: error.message,
        id: error.logId,
      },
      status: error.httpStatus,
    };
  }

  if (error instanceof SendEmailTimeoutError) {
    return { body: { error: error.message }, status: 504 };
  }

  return { body: { error: 'Internal Server Error' }, status: 500 };
}

function throwSendError(error: unknown): never {
  const failure = mapSendError(error);
  throwV1Error(failure.status, failure.body);
}

interface PendingIdempotency {
  lookup: IdempotencyLookupResult;
  requestHash: string;
}

function isPendingIdempotency(
  result: Record<string, unknown> | PendingIdempotency
): result is PendingIdempotency {
  return 'lookup' in result && 'requestHash' in result;
}

async function handleIdempotencyLookup(
  context: V1Context & EvlogOrpcContext,
  principal: ApiKeyPrincipal,
  idempotencyKey: string,
  input: SendEmailInput
): Promise<Record<string, unknown> | PendingIdempotency> {
  const requestHash = await hashSendRequestBody(input);
  const lookup = await lookupIdempotency(
    context.db,
    principal.id,
    idempotencyKey,
    requestHash,
    context.nowMs
  );

  if (lookup.type === 'replay') {
    if (lookup.statusCode === 200) {
      return lookup.body;
    }

    throwV1Error(lookup.statusCode, lookup.body);
  }

  if (lookup.type === 'conflict') {
    throwV1Error(409, { error: lookup.message });
  }

  if (lookup.type === 'error') {
    throwV1Error(500, { error: lookup.message });
  }

  return { lookup, requestHash };
}

const sendEmailDetailedInputSchema = z.object({
  body: sendEmailInputSchema,
  headers: z
    .object({
      'idempotency-key': z
        .string()
        .trim()
        .max(IDEMPOTENCY_KEY_MAX_LENGTH)
        .optional(),
    })
    .optional(),
});

export const v1Router = {
  me: apiKeyProcedure
    .route({ method: 'GET', path: '/me' })
    .handler(async ({ context }) => {
      const principal = context.principal;
      return {
        id: principal.id,
        keyType: principal.keyType,
        kind: principal.kind,
        projectId: principal.projectId,
        scopes: principal.scopes,
      };
    }),

  emails: sendScopeProcedure
    .route({
      inputStructure: 'detailed',
      method: 'POST',
      path: '/emails',
    })
    .input(sendEmailDetailedInputSchema)
    .handler(async ({ context, input }) => {
      const principal = context.principal;
      const idempotencyKey = input.headers?.['idempotency-key']?.trim() || null;

      context.log.set({
        email: {
          hasIdempotencyKey: Boolean(idempotencyKey),
          keyType: principal.keyType,
          toCount: Array.isArray(input.body.to) ? input.body.to.length : 1,
        },
      });

      let idempotencyLookup: IdempotencyLookupResult | null = null;
      let requestHash: string | null = null;

      if (idempotencyKey) {
        const lookupResult = await handleIdempotencyLookup(
          context,
          principal,
          idempotencyKey,
          input.body
        );

        if (!isPendingIdempotency(lookupResult)) {
          return lookupResult;
        }

        idempotencyLookup = lookupResult.lookup;
        requestHash = lookupResult.requestHash;
      }

      let reservedIdempotency = false;

      if (
        idempotencyKey &&
        requestHash &&
        idempotencyLookup?.type === 'continue'
      ) {
        const reserve = await reserveIdempotency(
          context.db,
          principal.id,
          idempotencyKey,
          requestHash,
          context.nowMs,
          idempotencyLookup.reclaim
        );

        if (reserve.type === 'conflict') {
          throwV1Error(409, { error: reserve.message });
        }

        if (reserve.type === 'error') {
          throwV1Error(500, { error: reserve.message });
        }

        reservedIdempotency = true;
      }

      const consume = createConsumeApiKeyRateLimiter(
        context.rateLimitKv,
        context.nowMs
      );
      const rateLimit = await consume.limit(principal.id);

      if (!rateLimit.success) {
        context.log.warn({
          action: 'v1.rate_limit_exceeded',
          apiKeyId: principal.id,
        });
        throwV1Error(429, { error: 'Rate limit exceeded' });
      }

      let outcome: { body: Record<string, unknown>; status: number };
      try {
        const result = await withTimeout(
          sendEmail(
            context.db,
            input.body,
            {
              keyId: principal.id,
              keyPrefix: principal.keyPrefix,
              keyType: principal.keyType,
              projectId: principal.projectId,
            },
            { emailBinding: context.emailBinding }
          ),
          SEND_EMAIL_TIMEOUT_MS
        );
        outcome = { body: { id: result.id }, status: 200 };
        context.log.set({ email: { logId: result.id, status: 'sent' } });
      } catch (error) {
        if (reservedIdempotency && idempotencyKey) {
          const failure = mapSendError(error);

          await completeIdempotency(
            context.db,
            principal.id,
            idempotencyKey,
            failure.status,
            failure.body
          );
        }

        throwSendError(error);
      }

      if (reservedIdempotency && idempotencyKey) {
        await completeIdempotency(
          context.db,
          principal.id,
          idempotencyKey,
          outcome.status,
          outcome.body
        );
      }

      return outcome.body;
    }),
};
