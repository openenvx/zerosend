import {
  Outlet,
  createFileRoute,
  redirect,
  useMatches,
  useRouterState,
} from '@tanstack/react-router';

import { DashboardShell } from '@/components/dashboard-shell';
import { FullscreenViewport } from '@/components/fullscreen-editor-layout';
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

const FULLSCREEN_EDITOR_PATH = /^\/(templates|automations)\/[^/]+$/;

function useIsFullscreenRoute() {
  const matches = useMatches();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  if (matches.some((match) => match.staticData.fullscreen)) {
    return true;
  }

  return FULLSCREEN_EDITOR_PATH.test(pathname);
}

function AuthedLayout() {
  const isFullscreen = useIsFullscreenRoute();

  if (isFullscreen) {
    return <Outlet />;
  }

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}

function AuthedPending() {
  const isFullscreen = useIsFullscreenRoute();

  if (isFullscreen) {
    return (
      <FullscreenViewport>
        <Loader />
      </FullscreenViewport>
    );
  }

  return (
    <DashboardShell>
      <Loader />
    </DashboardShell>
  );
}
