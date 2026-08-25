import { createDb } from '@zerosend/db';
import { env } from '@zerosend/env/server';

import { ApiKeyAdapter } from '../auth/api-key-adapter';
import {
  MissingFromAddressError,
  sendEmail,
  sendEmailInputSchema,
  SendEmailDeliveryError,
} from './send-email';

export async function handlePostEmails(request: Request): Promise<Response> {
  const adapter = new ApiKeyAdapter();
  const principal = await adapter.authenticate(request);

  if (!principal || principal.kind !== 'api_key') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!principal.scopes.includes('send')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = sendEmailInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message ?? 'Invalid request body',
      },
      { status: 400 }
    );
  }

  try {
    const result = await sendEmail(
      createDb(),
      parsed.data,
      {
        keyId: principal.id,
        keyPrefix: principal.keyPrefix,
        keyType: principal.keyType,
      },
      { emailBinding: env.EMAIL }
    );

    return Response.json({ id: result.id });
  } catch (error) {
    if (error instanceof MissingFromAddressError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SendEmailDeliveryError) {
      return Response.json(
        {
          code: error.code,
          error: error.message,
          id: error.logId,
        },
        { status: error.httpStatus }
      );
    }

    throw error;
  }
}
