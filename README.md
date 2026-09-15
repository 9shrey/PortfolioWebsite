# Shrey Singh — Portfolio

A minimalist, editorial portfolio for Shrey Singh — Machine Learning Engineer.
Built with **Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript**.

Cream on near-black, Instrument Serif display type, JetBrains Mono micro-labels,
Roman-numeral section markers, and a single warm accent. Rules instead of cards;
typography and spacing instead of effects.

## Sections

- **Hero** — name, positioning, current role, links
- **I. Work** — filterable index of every project; select a row for full detail
- **II. Experience** — roles as a compact timeline
- **III. Stack** — grouped, as text
- **IV. Contact** — email, LinkedIn, resume

## Design system

Defined entirely in `app/globals.css` as CSS custom properties:

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#0b0b0c` | Page |
| `--bg-2` | `#101012` | Drawer |
| `--fg` | `#ece8e1` | Cream text |
| `--fg-dim` / `--fg-mute` | — | Secondary / tertiary text |
| `--rule` / `--rule-soft` | — | Hairline dividers |
| `--accent` | `#d8a13f` | Warm amber, used sparingly |

Key patterns: `.index-row` (hovering one row dims its siblings), `.link`
(underline wipe), `.btn` (hairline, never filled), `.micro` (mono label).

## Interactions

No animation libraries — plain React, CSS, and one `IntersectionObserver`.

- **Scroll reveal** — fade-up on entry, with two failsafes so content is never
  stranded invisible: a timeout in `Reveal.tsx` if the observer never fires, and
  a `<noscript>` style override if scripts never run at all
- **Hero entrance** — CSS-only, runs on load rather than waiting on an observer
- **Project drawer** — right-side panel with problem / system / evidence, closes
  on Escape, locks body scroll
- **Scroll progress** — hairline accent bar
- **Reduced motion** — all transitions collapse under
  `prefers-reduced-motion: reduce`

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## Content

All project data lives in `app/data/projects.ts` — one typed `Project` array
drives the index, the filters, and the drawer. Project visuals are hand-authored
SVGs in `public/project-visuals/`, resolved by slug.

Resume PDF lives at `public/Shrey_Singh_Resume.pdf`.

## Deploy

Any Next.js-compatible host (Vercel recommended).

## Credits

Built by Shrey Singh — [github.com/9shrey](https://github.com/9shrey).
