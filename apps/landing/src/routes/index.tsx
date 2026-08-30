import { createFileRoute } from '@tanstack/react-router';

import { Footer } from '@/components/footer';
import { HomeAgentSkill } from '@/components/home/home-agent-skill';
import { HomeApi } from '@/components/home/home-api';
import { HomeAutomations } from '@/components/home/home-automations';
import { HomeFaq } from '@/components/home/home-faq';
import { HomeFeatures } from '@/components/home/home-features';
import { HomeFinalCta } from '@/components/home/home-final-cta';
import { HomeHero } from '@/components/home/home-hero';
import { HomePipeline } from '@/components/home/home-pipeline';
import { SiteHeader } from '@/components/site-header';
import { SITE } from '@/lib/site';

function LandingPage() {
  return (
    <div className="bg-marketing-surface-base flex min-h-screen w-full flex-col">
      <a
        className="focus:bg-paper-white focus:text-marketing-inverse sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:px-4 focus:py-2"
        href="#main"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main className="flex-1" id="main">
        <HomeHero />
        <HomeFeatures />
        <HomeApi />
        <HomePipeline />
        <HomeAutomations />
        <HomeAgentSkill />
        <HomeFaq />
        <HomeFinalCta />
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: `${SITE.name} - ${SITE.tagline}` },
      { content: SITE.description, name: 'description' },
      { content: `${SITE.name} - ${SITE.tagline}`, property: 'og:title' },
      { content: SITE.description, property: 'og:description' },
    ],
  }),
});
