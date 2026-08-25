/** Shared Tailwind class strings - Design.md marketing system. */

export const bodyText = 'f-body-md text-pretty text-marketing-subtle';

/** Mono eyebrow - Design.md `f-label` + subtler rank. */
export const sectionLabel = 'f-label text-marketing-subtler';

export const sectionIntro = 'mx-auto max-w-3xl text-center';

export const container =
  'mx-auto w-full max-w-(--breakpoint-xl) px-outer-gutter';

export const focusRingAccent =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue/45';

const btnBase =
  'group relative inline-flex h-10 cursor-pointer appearance-none items-center justify-center overflow-hidden rounded-md px-3.5 font-medium font-roobert text-sm no-underline outline-none transition-[background-color,border-color,color,transform] duration-300 ease-out select-none sm:h-11 sm:rounded-lg sm:px-4 sm:text-[15px]';

export const btnPrimary = `${btnBase} bg-marketing-surface-base-inverse text-marketing-inverse hover:bg-marketing-surface-base-inverse-subtle active:scale-[0.96]`;

export const btnGhost = `${btnBase} bg-transparent text-paper-white active:scale-[0.96] active:bg-marketing-surface-faded-bolder`;

export const cardCapability =
  'rounded-lg border border-marketing-divider bg-marketing-surface-raised p-6 transition-colors duration-200 hover:border-marketing-divider-bold';

export const navScrollVeilDark =
  'pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ink-black/92 via-ink-black/72 to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)] mask-[linear-gradient(to_bottom,black_0%,black_78%,transparent_100%)]';
