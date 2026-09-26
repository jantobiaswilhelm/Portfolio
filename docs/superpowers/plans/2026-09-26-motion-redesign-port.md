# Port "D · Mix" motion prototype into the React app — implementation plan

**Source of truth:** `prototypes/proto-6-mix.html` (+ `prototypes/motion-data.js`), approved by Jan on 2026-09-26.
Port behaviour and look faithfully; where the prototype is imperative, keep it imperative inside React
effects/refs rather than re-inventing it with a different library.

**Every task ends with** `npm test`, `npm run lint` and `npm run build` green (repo rule).

## Section order (final)

| id | nav label | num | notes |
|---|---|---|---|
| hero | Home | — | develop-in, rack focus + AF cursor, print shrink, portrait print, idle tease, shutter on landing |
| about | About | 01 | statement word scrub, developing portrait print (profile.png), facts, marquee |
| projects | Projects | 02 | was "Work": rolling titles, dimmed siblings, cursor-follow preview, accordion |
| experience | Experience | 03 | NOW cards, pinned exposure timeline (desktop), drawing-line list (≤820px) |
| photography | Photography | 04 | counter-sliding columns, develop-from-paper tiles, viewfinder cursor, FLIP lightbox |
| contact | Contact | 05 | kinetic repelled letters, shutter button (flash + sound), magnetic socials |

Travel is removed. ProgressDots, Reveal, StatCounter, Marquee, MagneticButton, SectionHeading,
ProjectRow, Work, Travel, useTypewriter are replaced.

## Shared infrastructure (built first, lead agent)

- `src/styles/motion.css` — the prototype's CSS, ported. Class names kept, except the cursor ring is
  `.cur-circle` (Tailwind owns `.ring`). `html.hero-in`, `html.is-loading`, `html.has-cursor` classes
  on `<html>` keep driving CSS exactly like the prototype.
- `src/motion/ticker.ts` — the one rAF loop. `addTick(fn, { first? })` returns an unsubscribe.
  Exposes the shared frame state `S` (`y, sv` smoothed velocity, `vw, vh, px, py, pIn, dtN`).
  `useTick(fn)` hook subscribes with the latest closure.
- `src/motion/env.ts` — `RM` (prefers-reduced-motion, read once), `FINE` (hover+fine pointer),
  `EASE_OUT`, `EASE_MOVE`, `settled(anim, ms)`, `lerp/clamp/easeOutCubic/easeInOut/pad2`.
- `src/motion/reveal.ts` — `reveal` callback ref: observes the element with one shared
  IntersectionObserver and adds `.in` once (rootMargin `0px 0px -10% 0px`).
- `src/motion/Split.tsx` — `<Split text start?>` renders `.w > .ch > .chi[--i]` like the prototype's `split()`.
- `src/motion/sound.ts` — `useSound()` → `[on, setOn]` (persisted in `localStorage['jw-sound']`),
  `beep()` (AF double-beep), `shutter()` (soft two-tick, beep loudness — Jan was jump-scared by a loud one).
- `src/motion/cursor.ts` + `components/layout/Cursor.tsx` — the camera cursor. Mode chosen by
  delegation from `data-cursor` (`af` | `photo` | `dot`) or a/button → `link`. `cursorState`
  exposes `rx, ry` (lagging ring), `mode`, and `setAf(state, label?)` / `pulseAf()` for the hero.
  Photo mode reads `data-exif` from the hovered element.
- `components/layout/{Nav,Loader,Grain,Footer}.tsx`, `lib/smooth-scroll.tsx` driven by the ticker,
  exposing `scrollTo(id)`, `scrollToY(y, opts)`, `setScrollLocked`.
- Data: `src/data/timeline.ts` (corrected CV: numeric `from/to/planned`, `short`, certifications),
  `projects.ts` gains `hue`, `lib/sections.ts` updated.

## Parallel section tasks (sub-agents, disjoint files)

1. **Hero** — `components/sections/Hero.tsx` (+ test). Portrait: `public/images/portrait-oeschinensee.{webp,jpg}`, keep its 3550:4129 crop.
2. **About, Projects, Contact** — `About.tsx`, `Projects.tsx`, `Contact.tsx` (+ tests; Projects inherits the old Work accordion tests).
3. **Experience** — `Experience.tsx`, `lib/timeline-layout.ts` (pure: spans, lanes, playhead year, detail target — TDD) (+ tests).
4. **Photography + Lightbox** — `Photography.tsx`, `Lightbox.tsx`, `lib/columns.ts` (+ tests; keep every a11y/srcset contract
   from the existing tests; replace only the justified-rows assertions with column ones).

## Integration (lead)

App.tsx wiring, delete replaced files, full test/lint/build, browser pass (desktop + 390px),
commit, merge `redesign/single-page` → `main`, push (deploys to GitHub Pages).
