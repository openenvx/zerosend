import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import type { ReactNode } from 'react';

import { SITE } from '@/lib/site';

import appCss from '@/styles/app.css?url';

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-marketing-surface-base font-roobert text-paper-white flex min-h-screen flex-col antialiased">
        <RootProvider theme={{ defaultTheme: 'dark' }}>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
      { href: '/extension_icon.ico', rel: 'icon', type: 'image/x-icon' },
    ],
    meta: [
      { charSet: 'utf-8' },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      { title: `${SITE.name} - ${SITE.tagline}` },
      { content: SITE.description, name: 'description' },
    ],
  }),
});
