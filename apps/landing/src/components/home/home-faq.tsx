import { ChevronDown } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

import { Reveal } from '@/components/reveal';
import { HOME } from '@/content/home';
import { cn } from '@/lib/cn';
import { SITE } from '@/lib/site';
import {
  bodyText,
  container,
  focusRingAccent,
  sectionLabel,
} from '@/lib/ui-classes';

export function HomeFaq() {
  const { faq } = HOME;
  const baseId = useId();
  const [openId, setOpenId] = useState<string>(faq.items[0]?.id ?? '');

  const handleToggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? '' : id));
  }, []);

  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-marketing-surface-base py-section-lg text-paper-white scroll-mt-24"
      id="faq"
    >
      <div className={container}>
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24 lg:self-start" y={14}>
            <p className={sectionLabel}>{faq.label}</p>
            <h2 className="f-display-lg mt-5 text-balance" id="faq-heading">
              {faq.title}
            </h2>
            <p className={`${bodyText} mt-4`}>
              {faq.body}{' '}
              <a
                className="text-electric-blue underline-offset-4 hover:underline"
                href={SITE.github}
                rel="noopener noreferrer"
                target="_blank"
              >
                {faq.githubLabel}
              </a>
              .
            </p>
          </Reveal>

          <Reveal y={14}>
            <div className="flex flex-col">
              {faq.items.map((item, index) => {
                const open = item.id === openId;
                const triggerId = `${baseId}-${item.id}-trigger`;
                const panelId = `${baseId}-${item.id}-panel`;
                const isFirst = index === 0;
                const isLast = index === faq.items.length - 1;

                return (
                  <div
                    className={cn(
                      'border-marketing-divider overflow-hidden border bg-transparent',
                      isFirst && 'rounded-t-lg',
                      isLast && 'rounded-b-lg',
                      !isFirst && '-mt-px'
                    )}
                    key={item.id}
                  >
                    <button
                      aria-controls={panelId}
                      aria-expanded={open}
                      className={cn(
                        'hover:bg-marketing-surface-faded focus-visible:bg-marketing-surface-faded flex min-h-[58px] w-full items-center gap-4 px-5 py-5 text-left transition-colors outline-none',
                        focusRingAccent
                      )}
                      id={triggerId}
                      onClick={() => {
                        handleToggle(item.id);
                      }}
                      type="button"
                    >
                      <span className="text-paper-white min-w-0 flex-1 text-[15px] font-medium">
                        {item.question}
                      </span>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          'text-marketing-subtler size-4 shrink-0 transition-transform duration-300 ease-out',
                          open && 'rotate-180'
                        )}
                      />
                    </button>
                    <div
                      aria-hidden={!open}
                      aria-labelledby={triggerId}
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      id={panelId}
                      role="region"
                      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="f-body-sm text-marketing-subtle px-5 pb-5 text-pretty">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
