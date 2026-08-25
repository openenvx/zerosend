import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useCallback, useRef } from 'react';

/**
 * Pointer-following sheen for buttons and links. The gradient lives in a child
 * span translated by CSS custom properties, so tracking the cursor never
 * triggers layout - only a compositor transform.
 */
export function useSpotlight() {
  const glowRef = useRef<HTMLSpanElement>(null);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const glow = glowRef.current;
      if (!glow) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      glow.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      glow.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    },
    []
  );

  return { glowRef, handlePointerMove };
}

/** `bright` reads as a sheen on the white primary fill; `faint` lifts dark fills. */
type SpotlightTone = 'bright' | 'faint';

const GRADIENT: Record<SpotlightTone, string> = {
  bright:
    'radial-gradient(100px circle, rgba(255,255,255,1), rgba(255,255,255,0))',
  faint:
    'radial-gradient(100px circle, rgba(255,255,255,0.14), rgba(255,255,255,0))',
};

interface SpotlightGlowProps {
  glowRef: RefObject<HTMLSpanElement | null>;
  tone?: SpotlightTone;
}

export function SpotlightGlow({ glowRef, tone = 'faint' }: SpotlightGlowProps) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-[-100px] left-[-100px] z-0 size-[200px] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
      ref={glowRef}
      style={{
        backgroundImage: GRADIENT[tone],
        transform: 'translate(var(--pointer-x, 0px), var(--pointer-y, 0px))',
      }}
    />
  );
}
