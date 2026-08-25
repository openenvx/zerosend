import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import { DashboardShell } from '@/components/dashboard-shell';
import Loader from '@/components/loader';
import { getSession } from '@/lib/session';

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
  loader: async () => {
    const session = await getSession();
    if (!session.authenticated) {
      throw redirect({ to: '/login' });
    }

    return session;
  },
  pendingComponent: AuthedPending,
  pendingMinMs: 0,
  pendingMs: 0,
  staleTime: 60_000,
});

function AuthedLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}

function AuthedPending() {
  return (
    <DashboardShell>
      <Loader />
    </DashboardShell>
  );
}
