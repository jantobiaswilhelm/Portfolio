# Portfolio Single-Page Redesign — Design Spec

**Date:** 2026-07-09
**Author:** Jan Wilhelm (with Claude)
**Status:** Approved design → ready for implementation plan

## Purpose

Rebuild the personal portfolio (jantobiaswilhelm) as a single, continuous,
smooth-scrolling page — replacing the current multi-page hub + react-router
structure. The goal is a **seamless** feel (inspired by skjaeveland.ai, which
uses Lenis momentum scrolling) with a more **editorial, "designer-portfolio"**
visual language than the current dashboard-like layout.

The validated visual direction is captured in the prototype at
`prototypes/proto-2-elevated.html` — this spec describes the production build of
that prototype.

## Approach

**Fresh build.** A new, clean Vite + React + TypeScript project rather than
refactoring the existing `src/` in place. Existing assets are carried over:

- `public/images/**` (profile, 30 photos, project screenshots) — reused as-is
- Content/data (projects, timeline, travel, socials, photo list) — ported into
  new typed data modules
- Tailwind theme tokens (dark palette, gold accent, DM Sans / Space Grotesk)
- `.github/workflows/deploy.yml` and GitHub Pages base-path setup — carried over

The existing multi-page code (`src/pages/*`, `src/layouts/RootLayout`,
`src/components/*`, react-router) is **not** reused.

**Confirmed:** the fresh build happens **within the same git repository** —
replacing `src/`, keeping `public/`, git history, and deploy config. No new repo.

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Build | Vite + React 18 + TypeScript | matches current toolchain |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme`) | dark-only tokens |
| Smooth scroll | **Lenis** | the core "seamless" mechanic |
| Animation | **Motion** (Framer Motion) | reveals, transitions |
| Components | **21st.dev** registry (shadcn-compatible CLI) | polished animated pieces where they fit |
| Icons | lucide-react | as today |
| Routing | **none** — single page, hash anchors | react-router removed |
| Deploy | GitHub Pages (existing Actions workflow) | keep `BASE_URL` handling |

## Layout & Sections

One page, dark-only. Fixed top nav + right-side progress dots. Vertical flow:

1. **Hero** — full-viewport.
   - Editorial `Jan / Wilhelm.` wordmark (large, left-aligned)
   - Eyebrow: "Basel, Switzerland"
   - Typewriter role line: Developer → Photographer → MSc Student → Gamer
   - Lead paragraph
   - Stat counters: **Projects · Active · Frames** (count-up on view; values
     derived from data, not hardcoded)
   - Portrait (right column, editorial rounded frame, grayscale→color on hover)
   - Darkened full-bleed background photo (`DSCF9258.JPG`), swappable
   - Scroll cue
2. **01 · About** — big statement line + supporting paragraph; fact cards
   (Based in / Studying / Building with / Shooting on); tech-stack marquee.
3. **02 · Work** — interactive accordion list. Each row shows index / title /
   tagline / year / stack. Click expands **inline** to reveal description,
   highlights, screenshots (where available), and live/GitHub/publication links.
   One row open at a time.
4. **03 · Photography** — gap-free masonry grid of all frames + **full lightbox**
   (click to open fullscreen, ‹ › buttons, ←/→ keys, Esc to close, frame counter).
5. **04 · Travel** — 3 country cards (China / Denmark / UK) with flag, place,
   type, year; sourced from the `international` data.
6. **05 · Contact** — large closing wordmark + magnetic social buttons
   (Email, LinkedIn, GitHub, Instagram, Ko-fi) + footer.

## Component Architecture

Small, single-purpose units with clear boundaries:

- **AppShell** — page frame: mounts Lenis, renders `Nav`, `ProgressDots`, all
  sections in order, `Footer`, and the `Lightbox` portal.
- **Nav** — fixed top bar; condenses on scroll; highlights active section.
- **ProgressDots** — right-rail section dots with hover labels; click to scroll.
- **Hero**, **About**, **Work**, **Photography**, **Travel**, **Contact** — one
  component per section, each consuming its own data module.
- Shared UI: **SectionHeading** (`NN · Title` + rule), **Reveal** (scroll-in
  wrapper), **MagneticButton**, **Marquee**, **StatCounter**, **ProjectRow**
  (accordion), **PhotoGrid**, **Lightbox**.
- Hooks: **useLenis**, **useReveal** (IntersectionObserver), **useTypewriter**,
  **useCountUp**, **useActiveSection**.

Each section can be understood and tested in isolation, receives typed data as
props or via its data module, and depends only on shared UI + hooks.

## Data

Typed modules under `src/data/`:

- `projects.ts` — title, tagline, year, current, description, stack, highlights,
  links (live/github/publication), previews. (Ported from existing.)
- `timeline.ts` / `about.ts` — CV timeline, languages, facts.
- `travel.ts` — the 3 international entries.
- `socials.ts` — contact links.
- `photos.json` — the 30 frames (already maintained).

Stats (Projects / Active / Frames) are **computed** from `projects` and `photos`,
never hardcoded, so they can't drift.

## Design Tokens

Dark-only (no light theme, no toggle):

- Backgrounds: near-black `#08080a` / card `#131318`
- Accent: gold `#d4a853` (hover `#e5b964`)
- Text: `#ededf0` / `#9a9aa2` / `#63636c`; border `#232329`
- Fonts: DM Sans (body), Space Grotesk (headings)
- Motion: cubic-bezier(.2,.7,.2,1) easing; subtle animated gradient + film grain

## Accessibility & Performance

- Respect `prefers-reduced-motion` — disable Lenis smoothing, reveals, marquee,
  and count-ups; content remains fully readable.
- Lightbox: focus trap, Esc to close, keyboard nav, `alt` text on images.
- Nav/dots operable by keyboard; visible focus states.
- Lazy-load photos; provide sized images to avoid layout shift.
- Semantic landmarks (`<nav>`, `<main>`, `<section>` with headings).

## Out of Scope

- Light mode / theme toggle (explicitly dropped).
- Multi-page routing and per-project detail pages (detail is inline accordion).
- CMS/backend — content stays in typed data modules.
- Blog, i18n, analytics (not requested).

## Success Criteria

- One continuous page with Lenis smooth scroll; nav + dots track the active
  section and scroll to it.
- All six section blocks render from real data with the interactions above
  (accordion Work, lightbox Photography).
- Visual parity with `proto-2-elevated.html`, built with production components
  (21st.dev where suitable) rather than throwaway markup.
- Dark-only, gold accent, DM Sans / Space Grotesk.
- Reduced-motion users get a static, fully legible experience.
- Deploys to GitHub Pages via the existing workflow.
