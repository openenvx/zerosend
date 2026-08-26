import { ArrowUpRight, BookOpen, Check } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import {
  bodyText,
  container,
  focusRingAccent,
  sectionLabel,
} from '@/lib/ui-classes';

export function HomeAgentSkill() {
  const { agentSkill } = HOME;

  return (
    <section
      aria-labelledby="agent-skill-heading"
      className="bg-marketing-surface-base py-section-lg text-paper-white relative overflow-hidden"
      id="agent-skill"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-60"
        style={{
          background:
            'radial-gradient(45% 70% at 18% 0%, rgba(0,153,255,0.1), transparent 75%)',
        }}
      />
      <div className={container}>
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="min-w-0 lg:order-1" delay={0.1} y={24}>
            <div className="border-marketing-divider bg-marketing-surface-raised shadow-browser overflow-hidden rounded-lg border md:rounded-xl">
              <div
                aria-hidden
                className="from-electric-blue/80 via-electric-blue/20 h-1 bg-linear-to-r to-transparent"
              />
              <div className="p-5 sm:p-6">
                <div className="border-marketing-divider flex items-center gap-3 border-b pb-4">
                  <span className="bg-electric-blue/10 grid size-8 shrink-0 place-items-center rounded-md">
                    <BookOpen
                      aria-hidden
                      className="text-electric-blue size-4"
                    />
                  </span>
                  <span className="text-marketing-subtle min-w-0 truncate font-mono text-[12px]">
                    {agentSkill.file}
                  </span>
                </div>
                <div className="border-marketing-divider bg-marketing-surface-base mt-5 rounded-md border p-3.5">
                  <p className="f-micro text-marketing-subtlest mb-2">
                    Install
                  </p>
                  <code className="text-paper-white block overflow-x-auto font-mono text-[12px] whitespace-nowrap">
                    $ {agentSkill.installCommand}
                  </code>
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {agentSkill.preview.map((item) => (
                    <li
                      className="text-marketing-subtle flex items-start gap-2.5 text-[13px] leading-[1.55]"
                      key={item}
                    >
                      <Check
                        aria-hidden
                        className="text-electric-blue mt-0.5 size-4 shrink-0"
                        strokeWidth={2.5}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <div className="min-w-0 lg:order-2">
            <Reveal>
              <p className={sectionLabel}>{agentSkill.label}</p>
            </Reveal>
            <h2
              className="f-display-lg text-paper-white mt-5 text-balance"
              id="agent-skill-heading"
            >
              {agentSkill.titleLead}
            </h2>
            <Reveal delay={0.08}>
              <p className={`${bodyText} mt-6 max-w-[52ch]`}>
                {agentSkill.description}
              </p>
            </Reveal>
            <ul className="mt-7 flex flex-col gap-2.5">
              {agentSkill.points.map((point) => (
                <li
                  className="text-marketing-subtle flex items-start gap-2.5 text-[14px] leading-[1.6]"
                  key={point}
                >
                  <Check
                    aria-hidden
                    className="text-electric-blue mt-1 size-4 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <a
              className={`text-paper-white group hover:text-electric-blue mt-7 inline-flex w-fit items-center gap-1.5 rounded-sm text-[14px] font-medium transition-colors duration-150 ${focusRingAccent}`}
              href={agentSkill.href}
              rel="noopener"
              target="_blank"
            >
              {agentSkill.linkLabel}
              <ArrowUpRight
                aria-hidden
                className="text-electric-blue size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
