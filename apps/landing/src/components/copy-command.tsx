import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

import { COPY_COMMAND } from '@/content/home';
import { cn } from '@/lib/cn';
import { focusRingAccent } from '@/lib/ui-classes';

interface CopyCommandProps {
  className?: string;
  tone?: 'hero' | 'on-dark';
}

export function CopyCommand({ className, tone = 'hero' }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(COPY_COMMAND.value);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <button
      aria-label={copied ? 'Copied install command' : 'Copy send command'}
      className={cn(
        'group inline-flex items-center gap-3 rounded-md border py-2.5 pr-3 pl-5 font-mono text-[13px] transition-colors',
        focusRingAccent,
        tone === 'hero'
          ? 'border-marketing-divider-bold bg-marketing-surface-faded text-paper-white/85 hover:bg-marketing-surface-faded-bolder'
          : 'border-white/15 bg-white/[0.06] text-white/85 hover:bg-white/10',
        className
      )}
      onClick={handleCopy}
      type="button"
    >
      <span aria-hidden className="text-electric-blue select-none">
        $
      </span>
      <span>{COPY_COMMAND.display}</span>
      <span className="text-marketing-subtler group-hover:text-paper-white grid size-6 place-items-center rounded-md bg-white/10 transition-colors">
        {copied ? (
          <Check aria-hidden className="text-electric-blue size-3.5" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )}
      </span>
    </button>
  );
}
