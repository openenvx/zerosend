import { useCallback, useState } from 'react';

import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import { cn } from '@/lib/cn';
import {
  bodyText,
  container,
  focusRingAccent,
  sectionIntro,
  sectionLabel,
} from '@/lib/ui-classes';

type PlaygroundFile = (typeof HOME.playground.files)[number];

function CodeLines({ file }: { file: PlaygroundFile }) {
  return (
    <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.85] sm:p-6">
      <code>
        {file.lines.map((line, index) => (
          <span className="flex" key={`${file.id}-${index}`}>
            <span className="text-marketing-subtlest w-8 shrink-0 pr-4 text-right select-none">
              {index + 1}
            </span>
            <span
              className={
                line.tone === 'muted'
                  ? 'text-marketing-subtlest'
                  : line.tone === 'value'
                    ? 'text-electric-blue'
                    : 'text-paper-white/90'
              }
            >
              {line.text}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

export function HomeApi() {
  const { playground } = HOME;
  const [activeId, setActiveId] = useState<PlaygroundFile['id']>(
    playground.files[0].id
  );
  const active =
    playground.files.find((file) => file.id === activeId) ??
    playground.files[0];

  const handleSelect = useCallback((id: PlaygroundFile['id']) => {
    setActiveId(id);
  }, []);

  return (
    <section
      aria-labelledby="api-heading"
      className="bg-marketing-surface-base py-section text-paper-white scroll-mt-24"
      id="api"
    >
      <div className={container}>
        <div className={sectionIntro}>
          <Reveal>
            <p className={sectionLabel}>{playground.label}</p>
          </Reveal>
          <h2 className="f-display-lg mt-5 text-balance" id="api-heading">
            {playground.title}
          </h2>
          <Reveal delay={0.06}>
            <p className={`${bodyText} mx-auto mt-6 max-w-[52ch]`}>
              {playground.body}
            </p>
          </Reveal>
        </div>

        <Reveal className="relative mx-auto mt-14 max-w-3xl" delay={0.1} y={24}>
          <div className="border-marketing-divider bg-marketing-surface-raised shadow-browser overflow-hidden rounded-lg border">
            <div className="border-marketing-divider relative flex items-center gap-2 border-b px-4 py-3">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
              </span>
              <span className="text-marketing-subtlest absolute left-1/2 hidden -translate-x-1/2 font-mono text-[11px] sm:block">
                zerosend - POST /v1/emails
              </span>
            </div>
            <div className="grid sm:grid-cols-[210px_1fr]">
              <div
                aria-label="Request examples"
                className="border-marketing-divider flex gap-1 overflow-x-auto border-b p-2 sm:flex-col sm:border-r sm:border-b-0 sm:p-3"
                role="tablist"
              >
                <p className="f-micro text-marketing-subtlest hidden px-2 pt-1 pb-2 sm:block">
                  Explorer
                </p>
                {playground.files.map((file) => {
                  const selected = file.id === active.id;
                  return (
                    <button
                      aria-selected={selected}
                      className={cn(
                        'relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-[12px] transition-colors',
                        focusRingAccent,
                        selected
                          ? 'text-paper-white'
                          : 'text-marketing-subtler hover:text-paper-white'
                      )}
                      key={file.id}
                      onClick={() => {
                        handleSelect(file.id);
                      }}
                      role="tab"
                      type="button"
                    >
                      {selected ? (
                        <span
                          aria-hidden
                          className="bg-marketing-surface-faded-bolder absolute inset-0 rounded-md"
                        />
                      ) : null}
                      <span className="relative z-1 flex items-center gap-2">
                        <span
                          className={`size-1.5 rounded-full ${
                            file.id === 'ts'
                              ? 'bg-electric-blue'
                              : 'bg-marketing-subtler'
                          }`}
                        />
                        {file.name}
                        {file.optional ? (
                          <span className="bg-marketing-surface-faded text-marketing-subtlest rounded-md px-1.5 py-px font-sans text-[9px]">
                            env
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="bg-marketing-surface-base h-[280px] overflow-auto sm:h-[320px]">
                <CodeLines file={active} />
              </div>
            </div>
            <div className="border-marketing-divider bg-marketing-surface-base-subtle flex items-center gap-2 border-t px-4 py-2.5">
              <span
                aria-hidden
                className="bg-electric-blue size-1.5 shrink-0 rounded-full"
              />
              <p className="text-marketing-subtler truncate text-[12px]">
                {active.hint}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
