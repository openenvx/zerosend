import { SITE } from '@/lib/site';

interface LogoProps {
  className?: string;
  decorative?: boolean;
}

export function Logo({ className = 'size-5', decorative = false }: LogoProps) {
  return (
    <img
      alt={decorative ? '' : SITE.name}
      aria-hidden={decorative || undefined}
      className={`shrink-0 ${className}`}
      height={20}
      src="/extension_icon.svg"
      width={20}
    />
  );
}

interface LogoLockupProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function LogoLockup({
  className,
  iconClassName = 'size-5',
  wordmarkClassName = 'font-roobert text-[17px] font-medium',
  showWordmark = true,
}: LogoLockupProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <Logo className={iconClassName} decorative />
      {showWordmark ? (
        <span className={wordmarkClassName}>{SITE.name}</span>
      ) : null}
    </span>
  );
}
