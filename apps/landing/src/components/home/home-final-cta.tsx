import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen } from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { SpotlightGlow, useSpotlight } from '@/components/marketing/spotlight';
import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import {
  btnGhost,
  btnPrimary,
  container,
  sectionLabel,
} from '@/lib/ui-classes';

export function HomeFinalCta() {
  const { cta } = HOME;
  const primary = useSpotlight();
  const secondary = useSpotlight();

  return (
    <section
      aria-labelledby="get-started-heading"
      className="bg-marketing-surface-base py-section-lg text-paper-white relative overflow-hidden"
      id="get-started"
    >
      <div className={container}>
        <div className="relative overflow-hidden rounded-lg md:rounded-xl">
          <div
            aria-hidden
            className="bg-marketing-surface-raised absolute inset-0"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(0,153,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 50% 100%, rgba(255,255,255,0.06) 0%, transparent 55%)',
            }}
          />
          <div
            aria-hidden
            className="ring-marketing-divider-bold pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset md:rounded-xl"
          />

          <div className="relative flex flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-24">
            <Reveal>
              <p className={sectionLabel}>{cta.label}</p>
            </Reveal>
            <h2
              className="f-display-lg text-paper-white mt-5 max-w-2xl text-balance"
              id="get-started-heading"
            >
              {cta.title}
            </h2>
            <Reveal delay={0.1}>
              <p className="f-body-md text-marketing-subtle mt-4 max-w-md text-pretty">
                {cta.body}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <CopyCommand />
                <Link
                  className={btnPrimary}
                  onPointerMove={primary.handlePointerMove}
                  params={{ _splat: 'getting-started' }}
                  to="/docs/$"
                >
                  <SpotlightGlow glowRef={primary.glowRef} tone="bright" />
                  <span className="relative z-10 flex items-center gap-2">
                    Get started
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
                <Link
                  className={btnGhost}
                  onPointerMove={secondary.handlePointerMove}
                  params={{ _splat: '' }}
                  to="/docs/$"
                >
                  <SpotlightGlow glowRef={secondary.glowRef} />
                  <span className="relative z-10 flex items-center gap-2">
                    <BookOpen aria-hidden className="size-4" />
                    Read the docs
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
