import { cn } from '@zerosend/ui/lib/utils';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'text-xs',
        sm: 'px-1.5 py-0 text-[10px]',
      },
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
        outline: 'text-foreground border-border',
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
      },
    },
  }
);

function Badge({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
