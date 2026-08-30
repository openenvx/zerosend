import { ArrowDown, Clock3, Mail, Radio, Split } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import { bodyText, container, sectionLabel } from '@/lib/ui-classes';

function WorkflowPreview() {
  const { automations } = HOME;

  return (
    <div className="border-marketing-divider bg-marketing-surface-raised shadow-browser overflow-hidden rounded-lg border md:rounded-xl">
      <div className="border-marketing-divider flex items-center justify-between border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="bg-electric-blue/10 grid size-7 place-items-center rounded-md">
            <Radio aria-hidden className="text-electric-blue size-3.5" />
          </span>
          <span className="text-paper-white font-mono text-[12px]">
            {automations.workflowName}
          </span>
        </div>
        <span className="f-micro text-electric-blue">draft</span>
      </div>

      <div className="bg-marketing-surface-base p-4 sm:p-5">
        <ol className="relative flex flex-col gap-2.5">
          <li className="relative flex items-center gap-3">
            <span className="bg-electric-blue/10 text-electric-blue grid size-8 shrink-0 place-items-center rounded-md">
              <Radio aria-hidden className="size-3.5" />
            </span>
            <div className="border-marketing-divider bg-marketing-surface-raised min-w-0 flex-1 rounded-md border px-3 py-2.5">
              <p className="f-micro text-marketing-subtlest">Trigger</p>
              <p className="text-paper-white mt-1 truncate font-mono text-[12px]">
                {automations.trigger}
              </p>
            </div>
          </li>
          <li aria-hidden className="flex h-3 items-center pl-4">
            <ArrowDown className="text-marketing-subtlest size-3.5" />
          </li>
          <li className="relative flex items-center gap-3">
            <span className="bg-marketing-surface-raised text-marketing-subtle grid size-8 shrink-0 place-items-center rounded-md">
              <Clock3 aria-hidden className="size-3.5" />
            </span>
            <div className="border-marketing-divider bg-marketing-surface-raised min-w-0 flex-1 rounded-md border px-3 py-2.5">
              <p className="f-micro text-marketing-subtlest">Wait</p>
              <p className="text-paper-white mt-1 truncate font-mono text-[12px]">
                {automations.wait}
              </p>
            </div>
          </li>
          <li aria-hidden className="flex h-3 items-center pl-4">
            <ArrowDown className="text-marketing-subtlest size-3.5" />
          </li>
          <li className="relative flex items-center gap-3">
            <span className="bg-accent/10 text-electric-blue grid size-8 shrink-0 place-items-center rounded-md">
              <Mail aria-hidden className="size-3.5" />
            </span>
            <div className="border-accent/40 bg-accent/10 min-w-0 flex-1 rounded-md border px-3 py-2.5">
              <p className="f-micro text-electric-blue">Action</p>
              <p className="text-paper-white mt-1 truncate font-mono text-[12px]">
                {automations.action}
              </p>
            </div>
          </li>
        </ol>

        <div className="border-marketing-divider mt-4 flex items-center gap-2 border-t pt-4">
          <Split aria-hidden className="text-marketing-subtlest size-3.5" />
          <span className="text-marketing-subtlest text-[11px]">
            Add conditions and event waits as your workflow evolves.
          </span>
        </div>
      </div>
    </div>
  );
}

export function HomeAutomations() {
  const { automations } = HOME;

  return (
    <section
      aria-labelledby="automations-heading"
      className="bg-marketing-surface-base py-section-lg text-paper-white relative overflow-hidden"
      id="automations"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-70"
        style={{
          background:
            'radial-gradient(42% 70% at 78% 0%, rgba(0,153,255,0.12), transparent 75%)',
        }}
      />
      <div className={container}>
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="min-w-0" delay={0.1} y={24}>
            <WorkflowPreview />
          </Reveal>

          <div className="min-w-0 lg:order-first">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <p className={sectionLabel}>{automations.label}</p>
                <span className="f-micro border-electric-blue/30 bg-electric-blue/10 text-electric-blue rounded-full border px-2 py-1">
                  {automations.status}
                </span>
              </div>
            </Reveal>
            <h2
              className="f-display-lg mt-5 text-balance"
              id="automations-heading"
            >
              {automations.title}
            </h2>
            <Reveal delay={0.08}>
              <p className={`${bodyText} mt-6 max-w-[52ch]`}>
                {automations.body}
              </p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {automations.points.map((point) => (
                <div
                  className="border-marketing-divider border-l-2 pl-3"
                  key={point.title}
                >
                  <h3 className="f-heading-sm text-paper-white">
                    {point.title}
                  </h3>
                  <p className="f-body-sm text-marketing-subtle mt-1 text-pretty">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
