import { cn } from '@zerosend/ui/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-10 text-center',
        className
      )}
    >
      {Icon ? (
        <Icon
          aria-hidden
          className="text-muted-foreground size-6"
          strokeWidth={1.5}
        />
      ) : null}
      <div className="space-y-1">
        <p className="text-section text-foreground">{title}</p>
        {description ? (
          <p className="text-body text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
