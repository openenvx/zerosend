import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/logo';
import { SpotlightGlow, useSpotlight } from '@/components/marketing/spotlight';
import { NAV_LINKS, SITE } from '@/lib/site';
import { btnPrimary, container, navScrollVeilDark } from '@/lib/ui-classes';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const cta = useSpotlight();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {scrolled ? <div aria-hidden className={navScrollVeilDark} /> : null}
      <div
        className={`relative flex h-(--marketing-header-height) items-center ${container} w-full`}
      >
        <Link
          aria-label={SITE.name}
          className="font-roobert text-paper-white relative z-10 flex items-center gap-2 text-[17px] font-medium no-underline"
          to="/"
        >
          <Logo className="size-5" decorative />
          {SITE.name}
        </Link>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex"
        >
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/#') ? (
              <a
                className="f-body-sm text-marketing-subtler hover:text-paper-white no-underline transition-colors"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ) : (
              <Link
                className="f-body-sm text-marketing-subtler hover:text-paper-white no-underline transition-colors"
                key={link.href}
                params={{ _splat: '' }}
                to="/docs/$"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <Link
          className={`${btnPrimary} relative z-10 ml-auto`}
          onPointerMove={cta.handlePointerMove}
          params={{ _splat: 'getting-started' }}
          to="/docs/$"
        >
          <SpotlightGlow glowRef={cta.glowRef} tone="bright" />
          <span className="relative z-10 flex items-center gap-2">
            Get started
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      </div>
    </header>
  );
}
