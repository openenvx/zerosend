import { Link } from '@tanstack/react-router';

import { GithubMark } from '@/components/github-mark';
import { LogoLockup } from '@/components/logo';
import { SITE } from '@/lib/site';
import { bodyText, container } from '@/lib/ui-classes';

const FOOTER_COLUMNS = [
  {
    links: [
      { href: '/#features', label: 'Features' },
      { href: '/#api', label: 'API' },
      { href: '/#faq', label: 'FAQ' },
    ],
    title: 'Product',
  },
  {
    links: [
      { href: '/docs', label: 'Docs', internal: true },
      {
        href: '/docs/getting-started',
        label: 'Getting started',
        internal: true,
      },
      { href: SITE.github, label: 'GitHub', external: true },
    ],
    title: 'Resources',
  },
] as const;

export function Footer() {
  return (
    <footer className="border-marketing-divider bg-marketing-surface-base text-paper-white border-t pt-16 md:pt-20">
      <div className={container}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] lg:gap-16">
          <div className="max-w-[420px]">
            <LogoLockup wordmarkClassName="font-roobert text-[17px] font-medium text-paper-white" />
            <p className={`${bodyText} mt-6`}>{SITE.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="f-label text-marketing-subtlest">
                  {column.title}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {'internal' in link && link.internal ? (
                        <Link
                          className="f-body-sm text-marketing-subtler hover:text-paper-white no-underline transition-opacity hover:opacity-100"
                          params={{
                            _splat:
                              link.href === '/docs'
                                ? ''
                                : link.href.replace('/docs/', ''),
                          }}
                          to="/docs/$"
                        >
                          {link.label}
                        </Link>
                      ) : 'external' in link && link.external ? (
                        <a
                          className="f-body-sm text-marketing-subtler hover:text-paper-white no-underline transition-opacity"
                          href={link.href}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          className="f-body-sm text-marketing-subtler hover:text-paper-white no-underline transition-opacity"
                          href={link.href}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-marketing-divider mt-16 flex flex-wrap items-center justify-between gap-4 border-t py-6">
          <p className="text-marketing-subtlest font-mono text-[11px]">
            © {new Date().getFullYear()} {SITE.name}. Open source.
          </p>
          <a
            aria-label="GitHub"
            className="text-marketing-subtler hover:bg-marketing-surface-raised hover:text-paper-white focus-visible:ring-electric-blue/45 grid size-10 place-items-center rounded-md transition-colors outline-none focus-visible:ring-2"
            href={SITE.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubMark />
          </a>
        </div>
      </div>

      <div className="w-full overflow-hidden leading-none">
        <p
          aria-hidden
          className="font-roobert text-paper-white/6 text-center text-[clamp(4rem,18vw,14rem)] leading-[0.76] font-light tracking-tight whitespace-nowrap select-none"
        >
          {SITE.name}
        </p>
      </div>
    </footer>
  );
}
