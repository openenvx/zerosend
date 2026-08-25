import { Check, Cloud, KeyRound, Mail, Server } from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import {
  bodyText,
  cardCapability,
  container,
  sectionIntro,
  sectionLabel,
} from '@/lib/ui-classes';

function WorkerVisual() {
  return (
    <div className="border-marketing-divider bg-marketing-surface-base flex min-h-[168px] flex-col justify-center gap-2 rounded-md border p-4">
      <div className="border-accent/50 bg-accent/10 flex items-center gap-3 rounded-md border px-3 py-2.5">
        <Server aria-hidden className="text-accent size-4" />
        <div className="min-w-0 flex-1">
          <p className="f-heading-sm text-paper-white">apps/zerosend</p>
          <p className="f-label text-marketing-subtler mt-0.5 tracking-normal normal-case">
            dashboard · /v1 · queues
          </p>
        </div>
      </div>
      <div className="border-marketing-divider flex items-center gap-3 rounded-md border px-3 py-2.5">
        <Cloud aria-hidden className="text-marketing-subtler size-4" />
        <div className="min-w-0 flex-1">
          <p className="f-heading-sm text-paper-white">Cloudflare Worker</p>
          <p className="f-label text-marketing-subtler mt-0.5 tracking-normal normal-case">
            one deploy
          </p>
        </div>
      </div>
    </div>
  );
}

function ApiVisual() {
  return (
    <div className="border-marketing-divider bg-marketing-surface-base flex min-h-[168px] items-center justify-center rounded-md border p-4">
      <div className="border-marketing-divider bg-marketing-surface-raised w-full max-w-[280px] rounded-md border px-4 py-3 font-mono text-[12px] leading-[1.9]">
        <div>
          <span className="text-electric-blue">POST</span>
          <span className="text-marketing-subtle"> /v1/emails</span>
        </div>
        <div className="text-marketing-subtlest pl-3">to: z.string()</div>
        <div className="text-marketing-subtlest pl-3">subject: z.string()</div>
        <div className="text-marketing-subtlest">{'}'}</div>
      </div>
    </div>
  );
}

function KeysVisual() {
  return (
    <div className="border-marketing-divider bg-marketing-surface-base flex min-h-[140px] flex-col justify-center gap-2 rounded-md border p-4">
      <div className="bg-marketing-surface-raised flex items-center justify-between rounded-md px-3 py-2">
        <span className="text-paper-white flex items-center gap-2 font-mono text-[12px]">
          <KeyRound aria-hidden className="text-marketing-subtlest size-3.5" />
          zs_live_7f3a
        </span>
        <span className="f-micro text-electric-blue">send</span>
      </div>
      <div className="flex items-center justify-between rounded-md px-3 py-2">
        <span className="text-marketing-subtle flex items-center gap-2 font-mono text-[12px]">
          <KeyRound aria-hidden className="text-marketing-subtlest size-3.5" />
          zs_test_91bc
        </span>
        <span className="f-micro text-marketing-subtlest">mailbox</span>
      </div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="border-marketing-divider bg-marketing-surface-base flex min-h-[140px] flex-col justify-center gap-2 rounded-md border p-4">
      {[
        { done: true, label: 'Sign in' },
        { done: true, label: 'Create an API key' },
        { done: false, label: 'Send your first email' },
      ].map((row) => (
        <div className="flex items-center gap-2" key={row.label}>
          <span
            className={`grid size-4 place-items-center rounded-full ${
              row.done
                ? 'bg-electric-blue text-ink-black'
                : 'bg-marketing-surface-faded-bolder'
            }`}
          >
            {row.done ? (
              <Check aria-hidden className="size-2.5" strokeWidth={3} />
            ) : null}
          </span>
          <span className="text-paper-white text-[12px]">{row.label}</span>
        </div>
      ))}
    </div>
  );
}

function LogsVisual() {
  return (
    <div className="border-marketing-divider bg-marketing-surface-base flex min-h-[140px] flex-col justify-center gap-2 rounded-md border p-3">
      <div className="bg-marketing-surface-raised flex items-center gap-2 rounded-md px-3 py-2">
        <span className="bg-electric-blue size-1.5 rounded-full" />
        <span className="text-paper-white min-w-0 flex-1 truncate text-[12px]">
          Invoice ready
        </span>
        <span className="text-marketing-subtlest font-mono text-[10px]">
          sent
        </span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <Mail aria-hidden className="text-marketing-subtlest size-3.5" />
        <span className="text-marketing-subtle min-w-0 flex-1 truncate text-[12px]">
          Password reset
        </span>
        <span className="text-marketing-subtlest font-mono text-[10px]">
          sent
        </span>
      </div>
    </div>
  );
}

const VISUALS = {
  api: ApiVisual,
  dashboard: DashboardVisual,
  keys: KeysVisual,
  logs: LogsVisual,
  worker: WorkerVisual,
} as const;

export function HomeFeatures() {
  const { features } = HOME;
  const gridItems = features.items.filter((item) => item.id !== 'deploy');
  const deploy = features.items.find((item) => item.id === 'deploy');

  return (
    <section
      aria-labelledby="features-heading"
      className="bg-marketing-surface-base py-section text-paper-white scroll-mt-24"
      id="features"
    >
      <div className={container}>
        <div className={sectionIntro}>
          <Reveal>
            <p className={sectionLabel}>{features.label}</p>
          </Reveal>
          <h2 className="f-display-lg mt-5 text-balance" id="features-heading">
            {features.title}
          </h2>
          <Reveal delay={0.06}>
            <p className={`${bodyText} mx-auto mt-6 max-w-[52ch]`}>
              {features.body}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-6">
          {gridItems.map((item, index) => {
            const Visual = VISUALS[item.id as keyof typeof VISUALS];
            const wide = item.id === 'worker' || item.id === 'api';

            return (
              <Reveal
                className={wide ? 'lg:col-span-3' : 'lg:col-span-2'}
                delay={0.04 * index}
                key={item.id}
                y={16}
              >
                <div className={`${cardCapability} flex h-full flex-col`}>
                  {Visual ? <Visual /> : null}
                  <h3 className="f-heading-sm text-paper-white mt-5">
                    {item.title}
                  </h3>
                  <p className="f-body-sm text-marketing-subtle mt-2 text-pretty">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}

          {deploy ? (
            <Reveal className="lg:col-span-6" delay={0.2} y={16}>
              <div className="border-marketing-divider bg-marketing-surface-raised flex flex-col items-start justify-between gap-4 rounded-lg border px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="f-heading-sm text-paper-white">
                    {deploy.title}
                  </h3>
                  <p className="f-body-sm text-marketing-subtle mt-1">
                    {deploy.body}
                  </p>
                </div>
                <CopyCommand />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
