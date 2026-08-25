import { Link } from '@tanstack/react-router';

import { Footer } from '@/components/footer';
import { SiteHeader } from '@/components/site-header';
import { btnPrimary, container } from '@/lib/ui-classes';

export function NotFound() {
  return (
    <div className="bg-marketing-surface-base text-paper-white flex min-h-screen w-full flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center" id="main">
        <div className={`${container} py-section text-center`}>
          <p className="f-label text-marketing-subtler">404</p>
          <h1 className="f-display-lg mt-5 text-balance">Page not found</h1>
          <p className="f-body-md text-marketing-subtle mx-auto mt-4 max-w-md text-pretty">
            That URL is not on this site. Head back to the landing page or open
            the docs.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link className={btnPrimary} to="/">
              <span className="relative z-10">Back home</span>
            </Link>
            <Link
              className="f-body-sm text-marketing-subtler hover:text-paper-white underline-offset-4 hover:underline"
              params={{ _splat: '' }}
              to="/docs/$"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
