# Shrey Singh — Portfolio

A minimalist, editorial portfolio for Shrey Singh — Machine Learning Engineer.
Built with **Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript**.

Design takes cues from editorial-web aesthetics: cream-on-near-black,
serif display typography (Instrument Serif), monospaced micro-labels
(JetBrains Mono), Roman-numeral section markers, and scroll-driven reveals.

## Sections

- **Prologue** — hero with animated flow-field background + identity
- **I. About** — bio + at-a-glance facts
- **II. Work** — selected projects with 3D tilt parallax
- **III. Toolkit** — languages, ML, data, infra
- **IV. Contact** — signal

## Interactions

Built without external animation libraries — pure React + Canvas2D + CSS.

- **Flow-field hero background** — particle field with mouse parallax pull
- **Custom cursor** — dot + ring with `mix-blend-mode: difference` and a soft accent spotlight
- **Scroll progress bar** — gradient indicator at the top of the page
- **Section rail** — right-edge scroll-spy with active-section indicator
- **Magnetic buttons** — CTAs gently attract toward the cursor
- **3D tilt** — project images respond to pointer with perspective + sheen
- **Split-text title** — letter-by-letter staggered reveal of the hero name
- **Live IST clock** — Bengaluru time in the navigation
- **Marquee ribbons** — seamless scrolling labels between sections
- **Reduced-motion + touch** — all effects gracefully degrade

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## Deploy

Any Next.js-compatible host (Vercel recommended).
Resume PDF lives at `public/Shrey_Singh_Resume.pdf`.

## Credits

Built by Shrey Singh — [github.com/9shrey](https://github.com/9shrey).
