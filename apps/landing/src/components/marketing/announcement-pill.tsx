import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface AnnouncementPillProps {
  children: ReactNode;
  href: string;
  /** Mono chip at the head of the pill - one word. */
  label: string;
}

/**
 * The notice above the hero headline. Square corners are deliberate: it is the
 * one sharp element left in the system, which is what stops it reading as a
 * button next to the rounded CTAs.
 */
export function AnnouncementPill({
  children,
  href,
  label,
}: AnnouncementPillProps) {
  return (
    <a
      className="group border-marketing-divider hover:border-marketing-divider-bold relative flex w-fit items-center gap-3 border py-0.5 pr-0.5 pl-4 font-medium no-underline transition-[border-color] duration-150 ease-out"
      href={href}
    >
      <span className="mask-flare-loop -ml-1.5 flex items-center gap-2 sm:-ml-1">
        <span className="bg-accent/20 text-accent inline-flex h-4 items-center px-1 font-mono text-[10px] leading-none tracking-wide uppercase">
          {label}
        </span>
        <span className="f-body-sm text-paper-white">{children}</span>
      </span>

      <span className="bg-accent/20 group-hover:bg-accent/30 p-1.5 transition-[background-color] duration-300 ease-out">
        <ArrowRight aria-hidden className="text-accent size-4" />
      </span>

      <span
        aria-hidden
        className="border-electric-blue pointer-events-none absolute -inset-px border -mask-linear-50 mask-linear-from-60% mask-linear-to-80% opacity-30 transition-opacity duration-150 ease-out group-hover:opacity-40"
      />
    </a>
  );
}
