import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/automations')({
  component: AutomationsLayout,
});

function AutomationsLayout() {
  return <Outlet />;
}
