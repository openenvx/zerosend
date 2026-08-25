import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen } from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { AnnouncementPill } from '@/components/marketing/announcement-pill';
import { SpotlightGlow, useSpotlight } from '@/components/marketing/spotlight';
import { ProductFrame } from '@/components/product-frame/product-frame';
import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import { btnGhost, btnPrimary, container } from '@/lib/ui-classes';

export function HomeHero() {
  const { hero } = HOME;
  const primary = useSpotlight();
  const secondary = useSpotlight();

  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-marketing-surface-base pb-outer-gutter text-paper-white relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
        style={{
          background:
            'radial-gradient(50% 45% at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 62%), radial-gradient(38% 34% at 50% 6%, rgba(0,153,255,0.07) 0%, transparent 58%)',
        }}
      />

      <div
        className={`${container} pt-section-sm relative mt-(--marketing-header-height)`}
      >
        <div className="flex flex-col items-center text-center">
          <Reveal delay={0.02} y={12}>
            <AnnouncementPill href={hero.tertiaryHref} label="Open">
              {hero.pill}
            </AnnouncementPill>
          </Reveal>

          <h1
            className="f-display-xl text-paper-white mt-6 max-w-4xl text-balance"
            id="hero-heading"
          >
            {hero.headline}
          </h1>

          <Reveal delay={0.1}>
            <p className="f-body-lg text-marketing-subtle mt-5 max-w-3xl text-pretty">
              {hero.support.before}
              <span className="text-paper-white font-medium">
                {hero.support.emphasisA}
              </span>
              {hero.support.middle}
              <span className="text-paper-white font-medium">
                {hero.support.emphasisB}
              </span>
              {hero.support.after}
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

      <div className={`${container} relative`}>
        <Reveal className="mt-section-sm" delay={0.12} y={32}>
          <ProductFrame />
        </Reveal>
        <p className="f-body-sm text-marketing-subtler mx-auto mt-5 max-w-3xl text-center text-pretty">
          {hero.mediaCaption}
        </p>
      </div>
    </section>
  );
}
