import { SidebarInset, SidebarProvider } from '@zerosend/ui/components/sidebar';
import { TooltipProvider } from '@zerosend/ui/components/tooltip';
import type { CSSProperties, ReactNode } from 'react';

import { AppSidebar } from './app-sidebar';

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
          <main className="flex min-h-0 flex-1 flex-col overflow-auto px-6 py-6 md:px-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
