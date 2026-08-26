import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { loadAdminSession } from '@zerosend/api/auth/admin-session';

export const getSession = createServerFn({ method: 'GET' }).handler(async () =>
  loadAdminSession(getRequest())
);
