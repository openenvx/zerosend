import { cn } from '@zerosend/ui/lib/utils';
import type { ComponentProps } from 'react';

const toneClasses = {
  active: 'bg-[var(--status-active)]',
  cancelled: 'bg-[var(--status-cancelled)]',
  completed: 'bg-[var(--status-completed)]',
  failed: 'bg-[var(--status-failed)]',
  pending: 'bg-[var(--status-pending)]',
} as const;

export type StatusDotTone = keyof typeof toneClasses;

interface StatusDotProps extends ComponentProps<'span'> {
  tone?: StatusDotTone;
  label?: string;
}

export function StatusDot({
  tone = 'pending',
  label,
  className,
  ...props
}: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          'size-2 shrink-0 rounded-full',
          toneClasses[tone],
          className
        )}
        {...props}
      />
      {label ? (
        <span className="text-body text-muted-foreground">{label}</span>
      ) : null}
    </span>
  );
}
