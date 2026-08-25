import { SidebarInset, SidebarProvider } from '@zerosend/ui/components/sidebar';
import { TooltipProvider } from '@zerosend/ui/components/tooltip';
import type { CSSProperties, ReactNode } from 'react';

import { AppSidebar } from './app-sidebar';
import { DashboardTopbar } from './dashboard-topbar';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider
        className="h-svh min-h-0"
        defaultOpen
        style={
          {
            '--sidebar-width': '168px',
            '--sidebar-width-icon': '56px',
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="bg-void flex min-h-0 flex-col">
          <DashboardTopbar />
          <main className="flex min-h-0 flex-1 flex-col overflow-auto px-6 py-8 md:px-8">
            <div className="mx-auto w-full max-w-[920px]">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
