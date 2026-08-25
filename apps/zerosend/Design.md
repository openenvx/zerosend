# ZeroSend Dashboard - Style Reference

> warm nocturnal assistant workspace - a spacious home surface on near-black, with soft charcoal modules, bright conversational type, and small functional color moments.

**Theme:** dark (default, always-on)

**Philosophy:** Calm assistant workspace

This direction follows the supplied dashboard screenshot: the product should feel like an approachable assistant that helps a person get started, not like an infrastructure console. The shell stays dark and focused, but the content breathes. Large greeting type, rounded modules, setup progress, integration marks, and small human details create warmth without adding decoration.

Research grounding:

- **Primary source:** supplied Lindy-style workspace screenshot - rail, greeting, assistant composer, setup checklist, stat/contact cards, and integration-led content.
- **Henry / ai.work:** soft-edged dark modules, spacious hierarchy, and restrained functional accent colors.
- **Metaview:** near-black canvas, generous breathing room, and high-contrast assistant-product atmosphere.
- **Linear:** tonal surface layering, precise navigation, and restrained borders.

This file is the visual system only: tokens, type, spacing, chrome, and reusable component patterns. Route maps, nav inventories, and feature status live elsewhere.

## Reference Lock

**Preserve:**

- Near-black canvas with a slightly lighter charcoal rail.
- Expanded left rail around 168px; compact icon rail around 56px.
- Large, friendly greeting above content rather than a compact page title.
- Two-column home composition: primary setup/work area plus narrow supporting cards.
- Soft 10-12px card corners and low-contrast surfaces instead of hard panel borders.
- Integration/provider marks as small, recognizable color moments.

**Borrow only:**

- Henry's soft translucent module treatment and multi-accent functional signals.
- Linear's disciplined tonal layering and quiet separators.

**Reject:**

- The previous luminous-blue command-center identity.
- Dense 12-13px-first layouts across the whole home surface.
- Developer-console framing, inspector-first chrome, and exposed keyboard hints as primary content.
- Decorative gradients, generic AI illustrations, colored status pills, and loud card shadows.

## Tokens - Colors

Implementation target: [`packages/ui/src/styles/globals.css`](../../packages/ui/src/styles/globals.css). These screenshot-aligned values are design direction; update shared tokens when dashboard chrome is implemented.

| Name | Value | Token | Role |
| --- | --- | --- | --- |
| Canvas | `#181716` | `--color-void` | Main app background |
| Rail | `#1D1C1B` | `--color-graphite` | Left navigation and workspace switcher |
| Module | `#252422` | `--color-slate` | Cards, composer, setup checklist, stat/contact panels |
| Module hover | `#2C2A28` | `--color-module-hover` | Hover and selected navigation/module state |
| Elevated module | `#302E2B` | `--color-module-elevated` | Popovers, menus, focused compact controls |
| Primary text | `#F4F1EC` | `--color-snow` | Greeting, headings, active labels |
| Body text | `#C5C0B9` | `--color-mist` | Descriptions, row labels, supporting copy |
| Muted text | `#817B74` | `--color-muted` | Metadata, timestamps, placeholders |
| Hairline | `rgba(255,255,255,0.06)` | `--color-border` | Rail edge, subtle dividers, field outlines |
| Primary action | `#F4F1EC` | `--color-primary` | High-confidence action fill with dark text |
| Primary action text | `#181716` | `--color-primary-foreground` | Text on light action controls |
| Focus border | `#D8D2C9` | `--focus-border-color` | Keyboard focus only |
| Overlay | `rgba(12,11,10,0.72)` | `--color-overlay` | Modal backdrop |

Do not treat provider colors as brand palette. Google, Slack, Telegram, phone, browser, and other integration marks keep their recognizable colors inside small icons only. They never become card backgrounds, text colors, or page accents.

### Semantic state colors

Setup and workflow state uses semantic dots/checks, not badge pills.

| Tone      | Value     | Use                                       |
| --------- | --------- | ----------------------------------------- |
| pending   | `#3A3937` | Incomplete setup step                     |
| active    | `#7EA7D9` | Current setup step or in-progress work    |
| completed | `#43C98A` | Finished setup step or successful outcome |
| failed    | `#E87979` | Failed action requiring attention         |
| cancelled | `#817B74` | Cancelled or unavailable state            |

Render workflow status through [`StatusDot`](../../packages/ui/src/components/ui/status-dot.tsx). Setup checklists may use a 16px circular check indicator when completion is the main interaction. Never use colored status badge pills.

### shadcn variable mapping

| Dashboard token     | shadcn variable                           |
| ------------------- | ----------------------------------------- |
| Canvas              | `--background`                            |
| Primary text        | `--foreground`                            |
| Module              | `--card`, `--popover`                     |
| Rail                | `--sidebar`                               |
| Module hover        | `--muted`, `--accent`, `--sidebar-accent` |
| Body text           | `--muted-foreground`                      |
| Primary action      | `--primary`                               |
| Primary action text | `--primary-foreground`                    |
| Hairline            | `--border`, `--sidebar-border`            |
| Focus border        | `--ring`, `--sidebar-ring`                |

## Tokens - Typography

**Inter Variable** remains sole UI typeface. Use it with more breathing room and stronger size contrast than the previous command-center system. Weight 400 carries most content; 500-600 marks headings and active labels. Do not introduce a display serif, script, or marketing font.

- **Source:** `@fontsource-variable/inter` via `packages/ui`
- **Weights:** 400, 500, 600
- **Line height:** 1.2 for navigation, 1.35 for body, 1.25 for headings
- **Letter spacing:** neutral to slightly negative on headings; never track small labels aggressively

Monospace remains reserved for identifiers, email addresses, key prefixes, and JSON where character-by-character comparison matters. Do not use monospace for ordinary home copy.

### Type scale

| Role          | Size | Line Height | Weight | Utility           |
| ------------- | ---- | ----------- | ------ | ----------------- |
| nav-label     | 12px | 1.2         | 400    | `text-nav`        |
| metadata      | 11px | 1.25        | 400    | `text-kbd`        |
| body          | 13px | 1.35        | 400    | `text-body`       |
| card-title    | 14px | 1.25        | 500    | `text-card-title` |
| section-title | 16px | 1.25        | 600    | `text-section`    |
| greeting      | 24px | 1.15        | 600    | `text-greeting`   |

Greeting and section headings use `text-wrap: balance`. Supporting prose uses `text-wrap: pretty` where it prevents an awkward final line.

## Tokens - Spacing & Shapes

**Base unit:** 4px · **Density:** comfortable compact

| Value | Role                                     |
| ----- | ---------------------------------------- |
| 4px   | Icon-to-label gap, tiny metadata gap     |
| 8px   | Row padding, compact control gap         |
| 12px  | Card gap, card internal spacing          |
| 16px  | Card padding, sidebar horizontal padding |
| 24px  | Main content section gap                 |
| 32px  | Main pane top/side breathing room        |

### Border radius

| Element                     | Value | Token              |
| --------------------------- | ----- | ------------------ |
| navigation rows             | 6px   | `--radius-nav`     |
| inputs and compact controls | 8px   | `--radius-control` |
| cards and modules           | 11px  | `--radius-panel`   |
| larger showcase modules     | 14px  | `--radius-feature` |
| circular icon actions       | full  | `--radius-full`    |
| modals and command palette  | 12px  | `--radius-modal`   |

Rounded corners are part of product warmth. Keep same component class consistent; do not mix sharp 4px panels with 24px cards.

### Focus behavior

Keyboard focus uses a single 1px light neutral border. No glow, stacked ring, or layout shift.

- Resting controls reserve `1px solid transparent`.
- On `:focus-visible`, swap border to `--focus-border-color`.
- Apply focus treatment only to keyboard focus, not mouse focus or selected navigation rows.
- Keep implementation in `globals.css`; do not re-declare focus rules per component.

## Layout

- **App shell:** `h-svh`; rail stays fixed while main content can scroll.
- **Expanded rail:** 168px on desktop; 56px icon-only collapse.
- **Rail padding:** 8px horizontal; workspace switcher and search sit near top.
- **Main pane:** centered content with 32px top padding and 24-32px horizontal padding.
- **Home max width:** 756-920px depending viewport.
- **Home grid:** primary column plus supporting column, typically `minmax(0, 1.55fr) minmax(240px, 1fr)`, 12px gap.
- **Narrow screens:** supporting column stacks below primary content; rail collapses or becomes a drawer.
- **Auth/onboarding:** centered public shell on same canvas, no dashboard rail.

```
┌───────────────┬────────────────────────────────────┐
│ Workspace rail │         Main assistant surface     │
│    168px       │                                    │
│                │  announcement / utility actions   │
│ switcher       │  greeting                          │
│ search         │  assistant composer                │
│ navigation     │  primary modules  │ support cards  │
└───────────────┴────────────────────────────────────┘
```

Shell composition remains `DashboardShell` → `SidebarProvider` + `AppSidebar` + `SidebarInset`. Main home composition should feel open and centered; do not fill every available pixel with panels.

## Components

### Workspace rail

Rail uses `--color-graphite` with one quiet right hairline. Workspace switcher is a compact row with a small avatar/initial mark, workspace name, and optional collapse control. Search is a low-contrast rounded field. Navigation rows are 30-32px high with 16px icons and 12px labels.

Active navigation uses `--color-module-hover` and primary text. No accent bar. Secondary sections use extra vertical breathing room, not heavy dividers.

### Announcement / utility pill

Small centered notice near the top of the main pane may announce an integration or workspace action. Use module-elevated fill, 8px radius, 11-12px text, and a close icon. It is transient utility chrome, not a banner competing with greeting.

### Greeting header

Home opens with a muted date/context line followed by a 24px greeting. Keep greeting left-aligned in the content column. Optional utility action, such as inviting a colleague, sits on the far right and uses a quiet outlined control.

### Assistant composer

The composer is a rounded module with a low-contrast fill. Prompt placeholder uses muted text. Attachment and voice/action controls remain small and monochrome; one primary assistant action may use a light circular button. Do not turn composer into a bright search box or a full-width gradient hero.

### Setup checklist

Use a rounded module with a concise section title and vertically stacked setup rows. Each row has:

1. 16px completion/pending indicator.
2. 16px provider or capability mark where relevant.
3. Clear 13px label.
4. Optional muted account detail.
5. Right-aligned action label and chevron.

Completed rows keep their place and become quieter; pending rows remain visibly actionable. Preserve provider icon colors only inside their marks.

### Stat and contact cards

Supporting cards are small rounded modules with 14px title, muted helper line, and compact two-column values or contact rows. Values may use 16px weight 500. Use thin iconography and generous internal spacing. Avoid turning every metric into a chart or colored badge.

### Content showcase modules

Feature/tutorial content may use a horizontal row of contained thumbnails or UI previews beneath a section title. Preview media must have stable dimensions and rounded 6px corners. Use real product screenshots or intentional placeholders; never fake complex media with arbitrary gradients.

### Page header

Every non-home page still uses [`PageHeader`](../../packages/ui/src/components/ui/page-header.tsx): 16px weight 600 title, optional 13px muted description, optional right-aligned action. Home greeting is the deliberate exception.

### Empty state

[`EmptyState`](../../packages/ui/src/components/ui/empty-state.tsx) uses one quiet 24px icon, a 16px title, one short body line, and at most one light primary action. Center it in the available module. No illustration wall or icon cluster.

### Data table

Operational lists may stay denser than home: 13px rows, subtle horizontal dividers, muted headers, tonal hover, and monospace identifiers. Status stays dot plus label. Tables are for high-volume information; home should use modules and guided actions.

### Workflow graph

Read-only DAG used on routine definition and workflow-run inspection. The visual pattern is GitHub Actions' job graph, adapted to dashboard tokens:

- Compact horizontal chips: `StatusDot` on the left, monospace step id, 40px tall, 8px radius, module fill, hairline border. No stacked kind/subtitle on the chip - inspect below.
- Left-to-right ranks with rounded orthogonal connectors. No arrowheads, minimap, or zoom chrome.
- Canvas stays zoomed in (fit-view floor around 1.2). Pan to explore; click a chip for configuration.

Do not treat this as a node editor. Nodes are not draggable or connectable.

### Case timeline

Split-pane Operations Inbox at `/cases`. List on the left, selected case on the right. This is not a mail client, document editor, project-management tool, or general team chat.

- List rows: 13px subject, muted sender and snippet, `StatusDot`, priority, source, assignee or unassigned, optional pending-action count, compact timestamp. Attention tabs: needs attention, handling, monitored, resolved, all. A second stationary facet row filters assignee, priority, and source (outline menus). Highlight the selected row with module hover fill. Do not lead with monospace ids.
- The inbox shell fills available app height. Its filter bar and case list remain in a stationary left pane; only the list rows scroll within that pane. The selected case detail scrolls independently on the right.
- Prepared actions strip: one quiet module at the top of the detail pane for founder decisions and draft edits. Primary approve / save actions; outline reject.
- Resource strip: compact chips with provider kind label and title; external URLs open in a new tab. Small provider marks only inside chips when needed.
- Timeline: chronological stack of artifacts. Customer mail and drafts are readable body text. Operator notes use quieter `text-tree` styling. Approvals, notices, tasks, and classify/knowledge steps are system events (`text-tree`) with `StatusDot`. No workflow DAG here.
- Case note composer: single textarea at the bottom of the case detail pane, not a workspace chat sidebar.

### Command palette

`⌘K` opens a centered 560px maximum-width modal with module-elevated fill, 12px radius, subtle hairline, and backdrop blur. Keep it useful but secondary to visible navigation. No luminous blue glow.

### Modal / overlay

Backdrop uses `--color-overlay`. Panel uses `--color-module-elevated`, 12px radius, and a subtle border. Primary action is light fill with dark text; secondary action is quiet outline/ghost.

Tall dialogs pin header and footer with `shrink-0`, use `flex flex-col max-h-[min(90vh,…)] overflow-hidden` on the panel, and give the body `flex-1 min-h-0 overflow-y-auto`.

## Do's and Don'ts

### Do

- Use near-black canvas and charcoal modules with clear but gentle tonal separation.
- Give home surfaces breathing room; let greeting and setup flow carry hierarchy.
- Use rounded 8-12px modules consistently.
- Keep provider colors inside recognizable integration marks.
- Use light neutral action controls for high-confidence actions.
- Use status dots/checks with labels, never colored badge pills.
- Put identifiers a human compares in monospace.
- Use `cursor-pointer` on interactive controls and clear `:focus-visible` states.
- Respect `prefers-reduced-motion`.
- Keep feature styling in component Tailwind classes; reserve `globals.css` for tokens and shell/focus rules.

### Don't

- Do not use luminous blue as default CTA, focus, or brand accent.
- Do not use indigo/violet gradients, glows, or decorative AI backgrounds.
- Do not make every home element a dense table or compact command-center row.
- Do not use large shadows; depth comes from surface tone and soft borders.
- Do not use provider colors as broad fills or arbitrary decoration.
- Do not use colored status pills.
- Do not add a second font family or light theme.
- Do not use decorative empty-state illustrations.
- Do not add route inventories or feature status to this file.

## Surfaces & Elevation

| Level | Name | Value | Purpose |
| --- | --- | --- | --- |
| 0 | Canvas | `#181716` | Main workspace ground |
| 1 | Rail | `#1D1C1B` | Navigation and workspace switcher |
| 2 | Module | `#252422` | Composer, setup, stats, contact cards |
| 3 | Elevated module | `#302E2B` | Menus, popovers, transient utility |
| - | Hairline | `rgba(255,255,255,0.06)` | Quiet structural separation |

Avoid default box shadows. If a modal needs separation, use backdrop dimming, a tonal shift, and a hairline. Cards should feel placed on the canvas, not floating above it.

## Decision Ledger

| Decision | Role rule | Why |
| --- | --- | --- |
| Near-black warm canvas | App ground | Matches supplied screenshot and keeps attention on assistant actions |
| 168px rail | Persistent workspace navigation | Screenshot shows compact labeled navigation, not an oversized enterprise sidebar |
| Rounded charcoal modules | Home grouping | Makes setup and assistant interactions approachable without decoration |
| Larger greeting type | Home entry point | Establishes human context before operational detail |
| Light neutral action fill | Primary action only | Keeps CTA visible without reintroducing blue as brand color |
| Provider colors in icons only | Integration identity | Preserves recognition without fragmenting palette |
| Semantic dots/checks | State | Clear progress without unreadable pill grids |
| Inter Variable | All UI text | Existing package font; readable at both home and operational density |
| Monospace identifiers | IDs, emails, payloads | Supports character-by-character comparison |
| No default shadows | All surfaces | Screenshot gets depth from charcoal tone changes, not floating chrome |
| GitHub Actions job graph | Workflow DAG | Compact status+id chips, orthogonal connectors, zoomed-in canvas, no minimap or zoom controls |

## Quick Color Reference

- Canvas: `#181716`
- Rail: `#1D1C1B`
- Module: `#252422`
- Module hover: `#2C2A28`
- Primary text: `#F4F1EC`
- Body text: `#C5C0B9`
- Muted text: `#817B74`
- Primary action: `#F4F1EC` with `#181716` text
- Hairlines: `rgba(255,255,255,0.06)`
- Completed state: `#43C98A`

## Similar References

- **Supplied screenshot** - spacious assistant home, setup checklist, integration-led cards, and human greeting.
- **Henry / ai.work** - soft dark modules and restrained functional color.
- **Metaview** - near-black AI-product atmosphere and generous composition.
- **Linear** - quiet tonal layering and disciplined navigation.

## Imagery

Product UI is primary. Use functional Lucide icons, provider marks, status indicators, and real product screenshots. Thumbnails may appear in tutorial/showcase modules, but they must explain a capability. No photography-led chrome, decorative 3D objects, or generic AI illustrations.
