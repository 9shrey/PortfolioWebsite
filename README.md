# Shrey Singh — Portfolio

An editorial-technical portfolio for Shrey Singh — AI/ML Engineer.
Built with **Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript · Motion · Lenis**.

## Design direction — "Evidence, rendered."

The content's argument is *proof, not demos* — 503 tests, leak-proof evaluation,
token-identical correctness gates, exact McNemar contrasts. So the site is built
to read like **instrumentation**: measured, precise, editorial. Cream on
near-black, Instrument Serif display against JetBrains Mono data labels, and
green demoted from decoration to **signal** — it only appears where something is
measured, active, or selected.

Rules instead of cards. Typography and whitespace instead of effects.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero → proof ledger → pinned horizontal work reel → approach → outro |
| `/work` | Editorial index of every project, filterable, with cursor-following preview |
| `/work/[slug]` | Case study: problem, system, evidence, retrospect, sticky meta rail |
| `/experience` | Scroll-drawn timeline |
| `/about` | Bio + capabilities as a focused accordion (not a badge wall) |
| `/now` | What's actually on the plate this month |
| `/contact` | Large-type close |
| `/writing` | Notes index — currently empty by design, not linked from the nav |

## Motion system

Three levels, encoded as CSS duration tokens so nothing animates at an
arbitrary speed:

| Level | Token | Used for |
| --- | --- | --- |
| 1 — Micro | `--d-1` (0.25s) | hover, magnetic pull, underline wipe, cursor states |
| 2 — Reveal | `--d-2` (0.6s) | section entrances, clip-path text masks, staggers |
| 3 — Cinematic | `--d-3` (1.1s) | hero entrance, pinned work reel, scroll-linked statement |

**Exactly three Level-3 moments exist on the whole site** — the hero, the work
reel, and the approach statement. Restraint is the point: everything else is
Level 1 or 2.

## Interaction notes

- **Pinned work reel** (`home/WorkReel.tsx`) — the section pins and project
  spreads travel sideways as you scroll. Horizontal distance is *measured*, and
  the section height is set to match, so wheel movement maps ~1:1 to travel.
  Only on wide, fine-pointer, motion-allowed viewports; everywhere else the
  same panels render as an ordinary vertical list, which is also the
  server-rendered default.
- **Scroll-linked statement** (`motion/ScrollWords.tsx`) — text resolves word by
  word as it travels up the viewport. Used once, on the one paragraph worth
  slowing a reader down for.
- **Hero field** (`home/Field.tsx`) — a ruled measurement grid revealed only
  where a pointer-tracked light sits. All CSS; JS writes two custom properties
  at most once per frame.
- **Cursor** (`layout/Cursor.tsx`) — viewfinder reticle with contextual states.
  Elements opt in via `data-cursor` / `data-cursor-label`. Fine pointers only,
  and the native cursor is hidden only *after* it mounts successfully.
- **Index rows** — hovering or focusing one row dims its siblings, so the list
  always has exactly one subject.

## Accessibility & resilience

- Reduced motion is respected in both CSS and JS — Lenis is never constructed,
  the reel falls back to a list, and every reveal resolves immediately.
- Scroll reveals have two failsafes so content is never stranded invisible: a
  timeout in `Reveal.tsx` if the observer never fires, and a `<noscript>`
  override if scripts never run.
- `PageTransition` uses plain CSS rather than Motion on purpose — Motion's mount
  detection can stall under Next's router transition and leave a page at
  opacity 0.
- Split headlines expose their real string to assistive tech (`aria-label` on
  headings, visually-hidden text for paragraphs).
- Skip link, visible focus rings, one `h1` per route, meaningful image alt text.

## Dependencies

Deliberately small — `framer-motion` for React motion and scroll primitives,
`lenis` (~7KB gz) for scroll easing. **No GSAP** (`useScroll` + `position:
sticky` already pin, so ScrollTrigger would be ~28KB gz of duplicate
capability), **no Three.js** (nothing here is genuinely spatial), and no
component libraries.

## Develop

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

```bash
npm run typecheck
```

## Content

All content is typed data, separate from presentation:

- `app/data/projects.ts` — drives the index, filters, reel, and case studies
- `app/data/experience.ts` — roles and their metrics
- `app/data/skills.ts` — capability groups
- `app/data/now.ts` — the `/now` list (update `updated` in the same commit)
- `app/data/writing.ts` — notes (currently empty)

Project visuals are hand-authored SVGs in `public/project-visuals/`, resolved by
slug. Resume PDF is `public/Shrey_Singh_Resume.pdf`.

## Components

```
app/components/
  layout/    Nav · Footer · Cursor · PageTransition · ScrollProgress · Terminal
  motion/    SmoothScroll · TextReveal · ScrollWords · Magnetic · Reveal · Counter · useMediaQuery
  home/      Hero · Field · Ledger · WorkReel · Statement · Outro
  work/      WorkIndex · ProjectPanel · ProjectDetail · HoverPreview
  ui/        PageHeader
  about/ · experience/ · contact/ · now/ · writing/
```

Press <kbd>`</kbd> anywhere for a terminal.

## Deploy

Any Next.js-compatible host (Vercel recommended).

## Credits

Built by Shrey Singh — [github.com/9shrey](https://github.com/9shrey).
