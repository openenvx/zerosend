# OpenEnvX - Style Reference

> Dark infrastructure-marketing system in the Liveblocks mould: semantic `marketing-*` tokens, one fluid type class per role, centered product-led hero, real product surfaces inside a soft-lit frame, and a single Electric Blue accent. Craft reference: [liveblocks.io](https://liveblocks.io). Color and voice stay OpenEnvX.

**Theme:** dark infrastructure marketing (ink-black canvas, centered hero, product surface as the argument)

The page is a dark canvas that never switches to a light theme. Structure comes from **semantic tokens, not palette names** - you write `bg-marketing-surface-raised` and `text-marketing-subtle`, never `bg-carbon` or `text-white/60`, so contrast decisions live in one place. Type uses **one class per role** (`f-display-xl`, `f-body-md`) that carries size, leading, tracking, and weight together; you never hand-assemble a type ramp at the call site. The hero is **centered**: announcement pill, one-sentence headline, a support paragraph that names the concurrency-style hard problem, two CTAs, then the product surface. That surface sits in a **soft-lit plate** - a warm ambient wash behind a rounded app frame - because the product is the argument and it needs to look lit, not pasted onto black.

Corners are **softly rounded** (`rounded-md` → `rounded-xl`, scaling up with surface size), which is a deliberate reversal of the earlier square-corner system. Motion is **one intentional beat per section**, driven by `ease-out-expo`, and every animated surface degrades to a static state under `prefers-reduced-motion`. Electric Blue (`#0099ff`) remains the only chromatic punctuation: active tabs, selection outlines, accent chips, focus rings, flow strokes. It never fills a primary button - primary buttons are Paper White with black text.

## Tokens - Colors

Raw palette. **Do not reference these directly in components** - go through the semantic layer below.

| Name | Value | Token | Role |
| --- | --- | --- | --- |
| Ink Black | `#000000` | `--color-ink-black` | Page canvas |
| Carbon | `#181818` | `--color-carbon` | Raised chrome - panels, tab bars, cards |
| Paper White | `#ffffff` | `--color-paper-white` | Primary text, primary CTA fill |
| Electric Blue | `#0099ff` | `--color-electric-blue` | The only accent |
| Ash | `#6d6d6d` | `--color-ash` | Muted text on light surfaces |
| Smoke | `#9a9a9a` | `--color-smoke` | Tertiary text |
| Graphite | `#636363` | `--color-graphite` | Utility button fill |
| Plate Warm | `#d8c3b4` | `--color-plate-warm` | Ambient plate behind product surfaces |
| Plate Cool | `#b9c4cf` | `--color-plate-cool` | Alternate ambient plate (API / render sections) |

### Semantic Tokens

This is the layer components consume. Three families: **surfaces**, **text ranks**, **dividers**.

| Token | Value | Use |
| --- | --- | --- |
| `--color-marketing-surface-base` | `#000000` | Page and section ground |
| `--color-marketing-surface-base-subtle` | `#0c0c0c` | Hover wash on base-level rows and tabs |
| `--color-marketing-surface-raised` | `#181818` | Chrome that sits above the canvas - tab bars, panels, cards |
| `--color-marketing-surface-faded` | `rgba(255,255,255,0.04)` | Inset wells, disabled fills, skeleton bars |
| `--color-marketing-surface-faded-bolder` | `rgba(255,255,255,0.08)` | Active/pressed state of a faded surface |
| `--color-marketing-surface-base-inverse` | `#ffffff` | Primary CTA fill |
| `--color-marketing-surface-base-inverse-subtle` | `rgba(255,255,255,0.9)` | Primary CTA hover |
| `--color-marketing-inverse` | `#000000` | Text on an inverse surface |
| `--color-marketing-subtle` | `rgba(255,255,255,0.66)` | Body copy, support paragraphs |
| `--color-marketing-subtler` | `rgba(255,255,255,0.45)` | Inactive tabs, captions, tertiary links |
| `--color-marketing-subtlest` | `rgba(255,255,255,0.28)` | Icon fills, mono micro-labels, empty-state text |
| `--color-marketing-divider` | `rgba(255,255,255,0.08)` | Default hairline |
| `--color-marketing-divider-bold` | `rgba(255,255,255,0.14)` | Structural hairline - frame outlines, tab-bar separators |

**Rule:** default text is `text-paper-white`. Every step down in importance is a named rank, not an ad-hoc opacity. If you find yourself writing `text-white/55`, pick the nearest rank instead.

## Tokens - Typography

Two faces only. **Roobert** (substitute: DM Sans) for everything readable; **JetBrains Mono** for eyebrow labels, template IDs, formats, and code. Never mix the roles.

### Fluid type roles

One utility class per role. Each sets `font-size`, `line-height`, `letter-spacing`, and `font-weight` together.

| Class | Size (clamp) | Leading | Tracking | Weight | Role |
| --- | --- | --- | --- | --- | --- |
| `f-display-xl` | `clamp(2.25rem, 5vw, 3.75rem)` | 1.05 | -0.022em | 300 | Hero H1 - one per page |
| `f-display-lg` | `clamp(1.875rem, 3.6vw, 2.75rem)` | 1.1 | -0.018em | 300 | Section H2 |
| `f-display-md` | `clamp(1.375rem, 2.2vw, 1.75rem)` | 1.2 | -0.012em | 300 | Sub-section / pillar lead-in |
| `f-heading-sm` | `1.0625rem` | 1.35 | -0.006em | 500 | Card titles |
| `f-body-lg` | `clamp(1.0625rem, 1.3vw, 1.1875rem)` | 1.5 | -0.004em | 400 | Hero support paragraph |
| `f-body-md` | `1rem` | 1.55 | normal | 400 | Default body |
| `f-body-sm` | `0.875rem` | 1.5 | normal | 400 | Card body, captions, secondary UI |
| `f-label` | `0.6875rem` | 1 | 0.14em | 500 | Mono uppercase eyebrow / micro-label |

**Emphasis inside body copy** uses `font-medium text-paper-white` on a `text-marketing-subtle` paragraph - the Liveblocks move of bolding the two phrases that carry the argument ("_concurrency becomes the problem_"). Use it at most twice per paragraph. Never bold a whole sentence, never go above weight 500 in display type.

### Legacy scale

The fixed `--text-heading-*` / `--text-display` / `--text-hero` tokens remain defined for existing sections but are **frozen** - new work uses the `f-*` roles. `--text-hero` (225px monument) is retired from marketing pages.

## Tokens - Spacing & Shapes

**Base unit:** 4px

### Layout rhythm

| Token | Value | Use |
| --- | --- | --- |
| `--spacing-outer-gutter` | `clamp(1rem, 4vw, 2.5rem)` | Horizontal page gutter (`px-outer-gutter`) and page bottom |
| `--spacing-section-sm` | `clamp(2.5rem, 5vw, 4rem)` | Gap between tightly coupled blocks (hero copy → media) |
| `--spacing-section` | `clamp(4.5rem, 8vw, 7rem)` | Default gap between sections |
| `--spacing-section-lg` | `clamp(6rem, 11vw, 9.5rem)` | Gap before a major pillar or the final CTA |
| `--marketing-header-height` | `64px` | Fixed header clearance - the hero offsets by exactly this |

Content column is `max-w-(--breakpoint-xl)` (1280px) centered, **not** the old 1440px. Wide product media may break out to `max-w-[1440px]` deliberately; body copy never exceeds `max-w-3xl`.

### Border Radius

Rounded is now the default. Radius scales with surface size, and the two nested radii in a frame differ by one step so the inner surface reads as _inside_ the outer one.

| Element                             | Value                      |
| ----------------------------------- | -------------------------- |
| Buttons                             | `rounded-md sm:rounded-lg` |
| Cards, panels, code blocks          | `rounded-lg`               |
| Ambient plate (product media outer) | `rounded-lg md:rounded-xl` |
| App frame (product media inner)     | `rounded-md md:rounded-lg` |
| Inputs, chips, icon tiles           | `rounded-md`               |
| Announcement pill, badges           | `0px` (square) - see below |
| Avatars, status dots                | `rounded-full`             |

**The announcement pill stays square.** It is the one surviving square element and it does real work: the sharp edge against everything else rounded is what makes it read as a notice rather than a button.

## Components

### Announcement Pill

**Role:** Above the hero H1 - links to the newest post, changelog entry, or launch

A square-cornered link split into three parts inside one hairline `border-marketing-divider` outline, with asymmetric padding (`pl-4 pr-0.5 py-0.5`) so the trailing tile fills its own end of the box:

1. **Label chip** - mono uppercase `f-label`, Electric Blue text on `bg-accent/20`, fixed `h-4` with tight `px-1`
2. **Copy** - `f-body-sm`, one short clause, no period
3. **Arrow tile** - `bg-accent/20` square with a 16px arrow, `group-hover:bg-accent/30`

Two overlays give it life. A **masked accent border** (`absolute -inset-px border border-electric-blue`) with `-mask-linear-50 mask-linear-from-60% mask-linear-to-80%` at `opacity-30` lights only one corner of the outline. A **flare sweep** (`mask-flare-loop`) passes a soft mask across the chip and copy every few seconds. Hover raises both. Under reduced motion the sweep stops and the border stays static.

### Spotlight Button

**Role:** Every hero and section CTA

Base: `h-10 sm:h-11`, `px-3.5 sm:px-4`, `rounded-md sm:rounded-lg`, `font-medium`, `overflow-hidden`, `transition duration-300 ease-out`. Variants differ **only in fill**:

- **Primary** - `bg-marketing-surface-base-inverse text-marketing-inverse`, hover `bg-marketing-surface-base-inverse-subtle`
- **Ghost** - transparent, `active:bg-marketing-surface-faded-bolder`, no border
- **Outline** - `border border-marketing-divider-bold`, transparent fill, hover `border` steps to bold

Each carries a **pointer spotlight**: an absolutely-positioned 200×200 child at `top:-100 left:-100`, translated by `--pointer-x` / `--pointer-y` set on pointer move, painted with `radial-gradient(100px circle, …)`, `opacity-0` → `group-hover:opacity-100`. The gradient is white at 100% for primary (reads as a sheen on white) and white at 12% for ghost/outline. Label sits in a `relative z-10` span above it.

Electric Blue never fills a button. Trailing arrows get `group-hover:translate-x-0.5`; dropdown chevrons get `size-3.5` and no motion.

### Product Surface Frame

**Role:** The hero visual, and any section that shows real product UI

Three nested layers, outside in:

1. **Ambient plate** - `rounded-lg md:rounded-xl`, `p-4 md:p-8 lg:p-10`, filled with a Plate Warm base plus a soft radial wash. This is the only place warm color appears in the system. It exists to light the frame; it carries no content and no text.
2. **App frame** - `rounded-md md:rounded-lg bg-ink-black shadow-browser`, with a `h-9 lg:h-12` chrome bar on top: three `bg-white/20` dots at the left, then the surface tabs.
3. **Surface** - `aspect-video`, real product regions only (toolbar, layers, canvas, inspector), never invented panels.

**Surface tabs** double as the autoplay indicator: each tab wraps its own absolutely-positioned overlay at `origin-left bg-white/20` whose `scaleX` tracks the active tab's progress, so the tab visibly fills while its surface plays. The active tab takes `bg-marketing-surface-raised text-paper-white`; inactive tabs are `text-marketing-subtler` with a `bg-marketing-surface-base-subtle` hover. Tabs are real `role="tab"` buttons and clicking one cancels autoplay.

### Before / After Wipe

**Role:** Showing the same surface with and without OpenEnvX

Two identically-framed surfaces stacked in the same box. The "without" layer is clipped with `clip-path: inset(0 calc(100% - var(--wipe)) 0 0)` where `--wipe` is a percentage. The seam is **two** absolutely-positioned spans at that offset: one crisp `bg-linear-to-b from-white/5 via-white/30 to-white/5`, one duplicate at `blur-md` - the blurred copy is what makes it read as light rather than a border.

The container is `cursor-ew-resize` and drag sets `--wipe` directly, cancelling autoplay. Both states are labelled in the caption below the frame, never overlaid on the surface. **Both layers must share pixel-identical chrome** - the wipe only works when the frame stays still and just the interior changes. On touch (`pointer-coarse`) the drag is disabled and autoplay carries the comparison.

### Capability Card

**Role:** The 4-6 card grids under each pillar

`rounded-lg border border-marketing-divider bg-marketing-surface-raised p-6`. A 20px lucide icon at `text-marketing-subtlest`, then `f-heading-sm` title, then `f-body-sm text-marketing-subtle` body of one or two sentences. No hover elevation, no gradient border, no number badges. Hover lifts the border to `divider-bold` only.

### Comparison Row

**Role:** The "familiar capability, named product" grid - Liveblocks' _Annotations like Google Docs_

Two-part label: the capability in `text-paper-white`, then the reference in `text-marketing-subtler`. For OpenEnvX these are format and product pairings (_Certificates like a design tool_, _Invoices from your API_). Keep them factual - do not name a customer we cannot cite.

### Code + Demo Split

**Role:** The developer-experience section

A two-column split at `lg+`: live product component on one side, real runnable code in a `rounded-lg bg-marketing-surface-raised` block on the other, with a mono filename bar on top. Code is real - copy-pasteable, correct imports, no `...` elisions. Syntax tints are code-only roles (`text-paper-white/90` keys, Electric Blue values); they never appear in UI chrome.

### Trust Band

**Role:** Compliance and scale proof, low in the page

A quiet row: uptime figure, SOC 2 / HIPAA-style badges as hairline square tiles, and a testimonial. Testimonials carry a name, role, and company or they do not ship.

### Top Navigation Bar

**Role:** Primary site navigation, fixed

Transparent over the hero - no fill, no border, no shadow. Height is `--marketing-header-height`. Logo left, centered link cluster, primary Spotlight Button right. On scroll a gradient-masked veil (`navScrollVeilDark`) darkens content passing underneath without painting a chrome layer. Active link carries an Electric Blue underline. Product dropdown panel: `rounded-lg bg-marketing-surface-raised`, hairline outline, two columns split by a `divide-marketing-divider` rule, mono `f-label` section labels.

### Footer

**Role:** Mega footer, three or four columns

Columns group into sub-lists with mono `f-label` headers (Realtime-style grouping: product areas, then resources, then company). Links at `f-body-sm text-marketing-subtler` hovering to `text-paper-white`. Status indicator and social row at the bottom, separated by a `border-marketing-divider` top rule.

## Landing Page Structure

The section order, mirroring the Liveblocks argument shape. Each numbered block is one section; the gap column is the `--spacing-section*` step _before_ it.

| # | Section | Gap before | Job |
| --- | --- | --- | --- |
| 1 | Hero | header | Pill → H1 → support → 2 CTAs → tabbed product surface with wipe → caption |
| 2 | Social proof | `section-sm` | "Trusted by …" line plus logo row. One sentence, one link out. |
| 3 | Capability grid | `section` | _Certificates like a design tool_ - familiar shapes, in a few lines of code |
| 4 | Pillar 1: the problem | `section-lg` | The hard problem stated plainly, bold on the two load-bearing phrases, then the infrastructure card grid (versioning, storage, rendering, assets, history, sessions) |
| 5 | Pillar 2: the outcome | `section-lg` | What shipping it earns you - engagement, adoption, revenue, focus. Business language, not feature language. |
| 6 | Editing modes | `section` | Full / constrained / headless, by configuration |
| 7 | Developer experience | `section-lg` | Code + demo split, docs and examples CTAs |
| 8 | Trust and scale | `section` | Testimonial, uptime, compliance tiles |
| 9 | Final CTA | `section-lg` | One sentence restating the transformation, two CTAs |
| 10 | Footer | - | Mega footer |

**Argument shape:** the hero shows the surface, section 3 makes it feel familiar, section 4 makes the hidden work visible (this is where the iceberg/ledger story lives), section 5 converts that into business upside, sections 6-8 answer "can I actually build on it", and section 9 closes. Do not reorder 4 and 5 - the cost has to land before the upside means anything.

## Motion

One beat per section, `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`), 200-500ms for interface response and up to 800ms for in-view reveals.

- **In-view reveal** - fade plus 12-24px rise via `Reveal`, staggered 40-80ms across siblings
- **Hero surface** - the tab autoplay and wipe sweep; this is the page's one continuous animation
- **Pointer spotlight** - opacity-gated, transform-driven, never triggers layout
- **Hover** - color and border only, 150-300ms. No scale, no elevation change, no shadow growth.

Everything animated must have a defined static state under `prefers-reduced-motion: reduce`: autoplay stops, the wipe holds at its midpoint, flares stop, reveals render at final position.

## Do's and Don'ts

### Do

- Consume the semantic tokens - `bg-marketing-surface-raised`, `text-marketing-subtle` - so contrast lives in one file
- Use one `f-*` class per text node; let it own size, leading, tracking, and weight
- Center the hero and let the product surface be the visual argument
- Light product media with the ambient plate - a frame on bare black looks pasted on
- Bold the two phrases in a paragraph that carry the claim, and no more
- Keep both wipe layers on pixel-identical chrome so the comparison reads as a diff
- Make autoplay indicators do double duty (the tab _is_ the progress bar)
- Keep display weight at 300 and card titles at 500 - the type ramp carries hierarchy, not weight
- Reserve Electric Blue for active tabs, selection outlines, accent chips, focus rings, and flow strokes
- Give every animation a reduced-motion resting state

### Don't

- Do not reach past the semantic layer to `bg-carbon` or `text-white/60` in new components
- Do not hand-assemble a type ramp (`text-[15px] leading-[1.4] tracking-tight`) - add an `f-*` role instead
- Do not put Electric Blue on a button fill or on body text
- Do not use purple, teal, amber, or any multi-hue gradient in UI chrome - the ambient plate is the only warm surface
- Do not invent product panels, fake dashboards, or floating metric badges in a product surface - only regions that exist
- Do not overlay the before/after labels on the surface, and do not let the two layers differ in chrome
- Do not animate scale or shadow on hover, and do not stack more than one continuous animation per viewport
- Do not go back to square corners on cards, panels, or media - the announcement pill is the only square element
- Do not stretch body copy past `max-w-3xl` or use the 225px monument scale on a marketing page
- Do not ship a testimonial without a name, role, and company

## Surfaces

| Level | Token | Value | Purpose |
| --- | --- | --- | --- |
| 0 | `marketing-surface-base` | `#000000` | Page and section ground |
| 1 | `marketing-surface-base-subtle` | `#0c0c0c` | Row and tab hover on the ground |
| 2 | `marketing-surface-faded` | `rgba(255,255,255,0.04)` | Inset wells, skeletons, disabled fills |
| 3 | `marketing-surface-raised` | `#181818` | Chrome above the canvas - tab bars, panels, cards |
| 4 | `plate-warm` | `#d8c3b4` | Ambient plate behind product media only |
| 5 | `marketing-surface-base-inverse` | `#ffffff` | Primary CTA fill |

## Elevation

Depth is tonal, not shadow-driven, with one exception. Surfaces step through the levels above; hairlines (`divider` → `divider-bold`) mark the boundaries. The exception is the **app frame**, which carries `--shadow-browser` (`0 40px 120px rgba(0,0,0,0.55)` plus a tight `0 2px 8px`) so it lifts off the ambient plate the way a real window would. Accent nodes may glow (`shadow-[0_0_12px_rgba(0,153,255,0.6)]`). Cards get no shadow at all.

## Imagery

**Primary:** real OpenEnvX product surfaces, rendered as React inside the Product Surface Frame - not screenshots. Rendered surfaces stay sharp at every viewport, can animate, and cannot drift out of date. When a raster is unavoidable, it goes in the same frame at 2x with explicit `width`/`height`.

**Diagrams** stay diagrammatic: flow lines, ledgers, pipelines in hairline strokes with Electric Blue pulses. Do not backfill a diagram with a fake screenshot.

**Banned:** stock photography, abstract 3D blobs, generic SaaS chrome, invented dashboards, floating badge soup, purple glow.

Iconography: lucide at 16px in CTAs and 20px in cards, `text-marketing-subtlest` unless active.

## Quick Start

### Tailwind v4 theme

```css
@theme {
  /* Palette - not consumed directly by components */
  --color-ink-black: #000000;
  --color-carbon: #181818;
  --color-paper-white: #ffffff;
  --color-electric-blue: #0099ff;
  --color-plate-warm: #d8c3b4;
  --color-plate-cool: #b9c4cf;

  /* Semantic surfaces */
  --color-marketing-surface-base: #000000;
  --color-marketing-surface-base-subtle: #0c0c0c;
  --color-marketing-surface-raised: #181818;
  --color-marketing-surface-faded: rgba(255, 255, 255, 0.04);
  --color-marketing-surface-faded-bolder: rgba(255, 255, 255, 0.08);
  --color-marketing-surface-base-inverse: #ffffff;
  --color-marketing-surface-base-inverse-subtle: rgba(255, 255, 255, 0.9);

  /* Semantic text ranks */
  --color-marketing-inverse: #000000;
  --color-marketing-subtle: rgba(255, 255, 255, 0.66);
  --color-marketing-subtler: rgba(255, 255, 255, 0.45);
  --color-marketing-subtlest: rgba(255, 255, 255, 0.28);

  /* Dividers */
  --color-marketing-divider: rgba(255, 255, 255, 0.08);
  --color-marketing-divider-bold: rgba(255, 255, 255, 0.14);

  /* Rhythm */
  --spacing-outer-gutter: clamp(1rem, 4vw, 2.5rem);
  --spacing-section-sm: clamp(2.5rem, 5vw, 4rem);
  --spacing-section: clamp(4.5rem, 8vw, 7rem);
  --spacing-section-lg: clamp(6rem, 11vw, 9.5rem);

  /* Motion + depth */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --shadow-browser:
    0 40px 120px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.4);
}

:root {
  --marketing-header-height: 64px;
}
```

Fluid type roles are `@utility f-display-xl { … }` declarations in `src/index.css` - see the table under **Tokens - Typography**.

## Similar Brands

- **Liveblocks (liveblocks.io)** - the structural reference: semantic marketing tokens, centered product-led hero, tabbed surface with a before/after wipe, pillar → cards → DX → trust → CTA argument shape
- **Vercel / Linear marketing** - dark monochrome restraint, product UI as proof, whisper-weight display type
- **Resend, Clerk** - infrastructure marketing that shows real component surfaces rather than illustration

## Example Component Prompts

1. **Hero** - Centered stack in `max-w-(--breakpoint-xl)`, offset by `--marketing-header-height`. Square announcement pill with Electric Blue chip and masked accent border. H1 at `f-display-xl` weight 300, `max-w-4xl`, balanced. Support at `f-body-lg text-marketing-subtle`, `max-w-3xl`, with two bolded phrases. Primary Spotlight Button plus ghost secondary. Below at `section-sm`: ambient plate → app frame → tabbed surface with before/after wipe, caption underneath in `f-body-sm text-marketing-subtler`.

2. **Spotlight Button** - `h-10 sm:h-11 px-3.5 sm:px-4 rounded-md sm:rounded-lg font-medium overflow-hidden group relative`. Primary fill `bg-marketing-surface-base-inverse text-marketing-inverse`. Child spotlight div: `absolute top-[-100px] left-[-100px] size-[200px] opacity-0 group-hover:opacity-100`, translated by `--pointer-x`/`--pointer-y`, `radial-gradient(100px circle, …)`. Label in `relative z-10`.

3. **Capability Card** - `rounded-lg border border-marketing-divider bg-marketing-surface-raised p-6`. 20px lucide icon `text-marketing-subtlest`, `f-heading-sm` title, `f-body-sm text-marketing-subtle` body. Hover steps the border to `divider-bold`. No shadow.

4. **Product Surface Frame** - Ambient plate `rounded-lg md:rounded-xl bg-plate-warm p-4 md:p-8 lg:p-10` with a radial wash. Inside: `rounded-md md:rounded-lg bg-ink-black shadow-browser` frame, `h-9 lg:h-12` chrome bar with three `bg-white/20` dots and `role="tab"` buttons whose progress overlay is `origin-left bg-white/20` with animated `scaleX`. Surface at `aspect-video`.

5. **Before / After Wipe** - Two pixel-identical surfaces stacked; top clipped by `clip-path: inset(0 calc(100% - var(--wipe)) 0 0)`. Seam is two spans at the offset - one crisp vertical gradient, one `blur-md` duplicate. Container `cursor-ew-resize`, drag sets `--wipe` and cancels autoplay, disabled on `pointer-coarse`.

6. **Electric Blue Flow Line** - Hairline `stroke-white/10` base paths with a solid `#0099ff` pulse via animated `stroke-dashoffset`. Accent nodes get a dot plus `shadow-[0_0_12px_rgba(0,153,255,0.6)]`. Single hue only.
