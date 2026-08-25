import { KeyRound, ScrollText, Terminal } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import type { ComponentType, RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiSurface } from '@/components/product-frame/api-surface';
import { DashboardSurface } from '@/components/product-frame/dashboard-surface';
import { LogsSurface } from '@/components/product-frame/logs-surface';

const CYCLE_MS = 7000;

const SURFACES = [
  { id: 'dashboard', icon: KeyRound, label: 'Dashboard' },
  { id: 'logs', icon: ScrollText, label: 'Logs' },
  { id: 'api', icon: Terminal, label: 'API' },
] as const;

const SURFACE_PANELS: Record<(typeof SURFACES)[number]['id'], ComponentType> = {
  api: ApiSurface,
  dashboard: DashboardSurface,
  logs: LogsSurface,
};

function SurfaceTab({
  active,
  icon: Icon,
  index,
  label,
  onSelect,
  progressRef,
}: {
  active: boolean;
  icon: (typeof SURFACES)[number]['icon'];
  index: number;
  label: string;
  onSelect: (index: number) => void;
  progressRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <div className="relative isolate h-9 shrink-0 lg:h-12">
      {active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 origin-left bg-white/20"
          ref={progressRef}
          style={{ transform: 'scaleX(0)' }}
        />
      ) : null}
      <button
        aria-controls="hero-surface-panel"
        aria-selected={active}
        className={`relative z-10 flex h-full cursor-pointer items-center gap-1.5 border-b-2 bg-transparent px-3.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-200 ease-out sm:gap-2 sm:px-4 lg:px-5 lg:text-xs ${
          active
            ? 'border-electric-blue text-paper-white'
            : 'text-marketing-subtler hover:bg-marketing-surface-base-subtle hover:text-marketing-subtle border-transparent'
        }`}
        onClick={() => {
          onSelect(index);
        }}
        role="tab"
        type="button"
      >
        <Icon
          aria-hidden
          className={`size-3.5 shrink-0 sm:size-4 ${
            active ? 'text-electric-blue' : 'text-marketing-subtlest'
          }`}
          strokeWidth={1.75}
        />
        {label}
      </button>
    </div>
  );
}

export function ProductFrame() {
  const [activeIndex, setActiveIndex] = useState(0);
  const progressRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const surface = SURFACES[activeIndex] ?? SURFACES[0];
  const Panel = SURFACE_PANELS[surface.id];

  const applyProgress = useCallback((value: number) => {
    const el = progressRef.current;
    if (el) {
      el.style.transform = `scaleX(${value})`;
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      applyProgress(1);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / CYCLE_MS;
      if (t >= 1) {
        setActiveIndex((index) => (index + 1) % SURFACES.length);
        return;
      }
      applyProgress(t);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [activeIndex, applyProgress, reducedMotion]);

  return (
    <div className="relative overflow-hidden rounded-lg p-3 sm:p-4 md:rounded-xl md:p-8 lg:p-10">
      <div aria-hidden className="bg-plate-warm absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 12% 0%, rgba(255,255,255,0.5), transparent 58%), radial-gradient(80% 70% at 92% 100%, rgba(0,0,0,0.3), transparent 55%)',
          }}
        />
      </div>

      <div className="bg-ink-black shadow-browser relative z-10 overflow-hidden rounded-md md:rounded-lg">
        <div className="border-marketing-divider-bold flex h-9 shrink-0 items-stretch border-b select-none lg:h-12">
          <span
            aria-hidden
            className="hidden flex-none items-center gap-1.5 self-center px-4 sm:flex md:px-5"
          >
            <span className="size-1.5 rounded-full bg-white/20 md:size-2" />
            <span className="size-1.5 rounded-full bg-white/20 md:size-2" />
            <span className="size-1.5 rounded-full bg-white/20 md:size-2" />
          </span>

          <div
            aria-label="Product surfaces"
            className="divide-marketing-divider-bold border-marketing-divider-bold flex h-9 min-w-0 flex-1 divide-x overflow-x-auto border-x lg:h-12"
            role="tablist"
          >
            {SURFACES.map((item, index) => (
              <SurfaceTab
                active={index === activeIndex}
                icon={item.icon}
                index={index}
                key={item.id}
                label={item.label}
                onSelect={setActiveIndex}
                progressRef={progressRef}
              />
            ))}
          </div>
        </div>

        <div
          aria-label={`${surface.label} surface`}
          className="relative aspect-video w-full"
          id="hero-surface-panel"
          role="tabpanel"
        >
          <div className="absolute inset-0">
            <Panel />
          </div>
        </div>
      </div>
    </div>
  );
}
