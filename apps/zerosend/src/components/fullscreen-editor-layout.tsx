import { Link } from '@tanstack/react-router';
import { StatusDot } from '@zerosend/ui/components/status-dot';
import { TooltipProvider } from '@zerosend/ui/components/tooltip';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type StatusTone = 'active' | 'completed' | 'success' | 'warning';

interface FullscreenEditorLayoutProps {
  actions?: ReactNode;
  backLabel: string;
  backTo: string;
  children: ReactNode;
  meta?: ReactNode;
  status?: {
    label: string;
    tone: StatusTone;
  };
  title: string;
  toolbar?: ReactNode;
}

export function FullscreenEditorLayout({
  actions,
  backLabel,
  backTo,
  children,
  meta,
  status,
  title,
  toolbar,
}: FullscreenEditorLayoutProps) {
  return (
    <TooltipProvider delay={0}>
      <div className="bg-void flex h-svh min-h-0 flex-col">
        <header className="border-border flex shrink-0 flex-col gap-2 border-b px-4 py-2 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="text-body text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
              to={backTo}
            >
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
            <h1 className="text-section truncate">{title}</h1>
            {status ? (
              <div className="flex items-center gap-2 text-sm">
                <StatusDot tone={status.tone} />
                <span>{status.label}</span>
              </div>
            ) : null}
            {meta}
            {actions ? (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {actions}
              </div>
            ) : null}
          </div>
          {toolbar ? (
            <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
          ) : null}
        </header>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}

export function FullscreenViewport({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <div className="bg-void flex h-svh min-h-0 flex-col overflow-hidden">
        {children}
      </div>
    </TooltipProvider>
  );
}
