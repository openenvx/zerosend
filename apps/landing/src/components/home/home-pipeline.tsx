import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import { bodyText, container, sectionLabel } from '@/lib/ui-classes';

export function HomePipeline() {
  const { pipeline } = HOME;
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % pipeline.steps.length);
    }, 1400);

    return () => window.clearInterval(id);
  }, [pipeline.steps.length, reducedMotion]);

  const currentStep = reducedMotion ? pipeline.steps.length - 1 : active;

  return (
    <section
      aria-labelledby="pipeline-heading"
      className="bg-marketing-surface-base py-section-lg text-paper-white"
      id="delivery"
    >
      <div className={container}>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className={sectionLabel}>{pipeline.label}</p>
            </Reveal>
            <h2
              className="f-display-lg mt-5 text-balance"
              id="pipeline-heading"
            >
              {pipeline.title}
            </h2>
            <Reveal delay={0.08}>
              <p className={`${bodyText} mt-6 max-w-[52ch]`}>{pipeline.body}</p>
            </Reveal>
            <div className="mt-8 flex flex-col gap-5">
              {pipeline.points.map((point) => (
                <div key={point.title}>
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

          <Reveal delay={0.1} y={24}>
            <div className="relative overflow-hidden rounded-lg p-4 sm:p-8">
              <div aria-hidden className="bg-plate-cool absolute inset-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(120% 90% at 12% 0%, rgba(255,255,255,0.45), transparent 58%), radial-gradient(80% 70% at 92% 100%, rgba(0,0,0,0.25), transparent 55%)',
                  }}
                />
              </div>
              <div className="bg-ink-black shadow-browser relative mx-auto max-w-sm rounded-md">
                <div className="border-marketing-divider flex h-11 items-center justify-between border-b px-4">
                  <span className="text-marketing-subtler font-mono text-[11px]">
                    POST /v1/emails
                  </span>
                </div>
                <div className="relative px-4 py-4">
                  <span
                    aria-hidden
                    className="bg-marketing-divider absolute top-6 bottom-6 left-[27px] w-px"
                  />
                  <div className="flex flex-col gap-3">
                    {pipeline.steps.map((step, index) => {
                      const lit = index <= currentStep;
                      const current = index === currentStep;
                      return (
                        <div
                          className="relative flex items-center gap-3"
                          key={step.title}
                          style={{ opacity: lit ? 1 : 0.35 }}
                        >
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-full ${
                              current
                                ? 'bg-electric-blue/20'
                                : 'bg-marketing-surface-raised'
                            }`}
                          >
                            {current && !reducedMotion ? (
                              <span className="bg-electric-blue size-2 animate-pulse rounded-full" />
                            ) : (
                              <span
                                className={`size-1.5 rounded-full ${
                                  lit
                                    ? 'bg-electric-blue'
                                    : 'bg-marketing-subtlest'
                                }`}
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-paper-white block truncate font-mono text-[12px]">
                              {step.title}
                            </span>
                            <span className="text-marketing-subtlest block truncate text-[11px]">
                              {step.detail}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="border-marketing-divider text-marketing-subtlest border-t px-4 py-2.5 font-mono text-[10px]">
                  step {currentStep + 1}/{pipeline.steps.length}
                  {currentStep === pipeline.steps.length - 1
                    ? ' · logged'
                    : ' · running'}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
