# Portfolio Single-Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as a single continuous, Lenis-smooth-scrolling page ("Elevated" editorial direction from `prototypes/proto-2-elevated.html`), within the existing repo.

**Architecture:** One React page composed of ordered section components (Hero → About → Work → Photography → Travel → Contact), driven by a shared section registry. A `SmoothScrollProvider` mounts Lenis; nav + side dots derive from the registry and track/scroll to the active section. Interactions: inline-accordion Work rows, fullscreen Photography lightbox. Dark-only. Pure logic (stats, hooks, active-section) is unit-tested; interactive components are tested with Testing Library; visuals are browser-verified.

**Tech Stack:** Vite 7 + React 19 + TypeScript, Tailwind CSS v4 (`@theme`), Lenis, framer-motion (motion), lucide-react. Vitest + @testing-library/react for tests. No react-router. GitHub Pages deploy (base `/Portfolio/`).

**Reference:** Design spec at `docs/superpowers/specs/2026-07-09-portfolio-single-page-redesign-design.md`. Visual target at `prototypes/proto-2-elevated.html`.

---

## File Structure

Created / modified in this plan:

```
package.json                     (modify: deps + scripts)
vitest.config.ts                 (create)
index.html                       (modify: drop SPA-redirect script)
src/
  main.tsx                       (modify: remove react-router)
  App.tsx                        (rewrite: AppShell composition)
  index.css                      (rewrite: dark-only @theme tokens + keyframes)
  test/
    setup.ts                     (create: jsdom polyfills)
  lib/
    sections.ts                  (create: section registry — single source)
    smooth-scroll.tsx            (create: Lenis provider + useSmoothScroll)
  data/
    projects.ts                  (port existing, unchanged)
    photos.json                  (keep existing)
    about.ts                     (create)
    timeline.ts                  (create)
    travel.ts                    (create)
    socials.ts                   (create)
    stats.ts                     (create: derived counts)
  hooks/
    usePrefersReducedMotion.ts   (create)
    useCountUp.ts                (create + pure countFrame)
    useTypewriter.ts             (create)
    useActiveSection.ts          (create + pure activeFromPositions)
  components/
    ui/
      Reveal.tsx                 (create)
      SectionHeading.tsx         (create)
      StatCounter.tsx            (create)
      Marquee.tsx                (create)
      MagneticButton.tsx         (create)
    layout/
      Nav.tsx                    (create)
      ProgressDots.tsx           (create)
      Footer.tsx                 (create)
    sections/
      Hero.tsx                   (create)
      About.tsx                  (create)
      Work.tsx                   (create)
      ProjectRow.tsx             (create)
      Photography.tsx            (create)
      Lightbox.tsx               (create)
      Travel.tsx                 (create)
      Contact.tsx                (create)
```

Deleted (old multi-page structure):
```
src/pages/*  src/layouts/*  src/components/{Hero,Photography,Projects,Skills,Travel,Contact}.tsx
src/components/ui/{PageTransition,PreviewCard}.tsx  src/data/{contact,skills}.ts
src/hooks/{useCountUp,useTypewriter}.ts (replaced)  public/404.html
```
(Deletion happens in the final task after the new build compiles.)

---

## Task 1: Dependencies, scripts, and test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Update `package.json` dependencies and scripts**

Replace the `dependencies`, `devDependencies`, and `scripts` blocks with:

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "framer-motion": "^12.26.2",
    "lenis": "^1.1.14",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwindcss": "^4.1.18"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "jsdom": "^25.0.1",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^3.0.5"
  }
```

Note: removed `react-router-dom`, `react-simple-maps`, `prop-types`; added `lenis`, `vitest`, `jsdom`, and Testing Library packages.

- [ ] **Step 2: Install**

Run: `npm install`
Expected: completes without peer-dependency errors; `node_modules/lenis` and `node_modules/vitest` exist.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 4: Create `src/test/setup.ts`** (jsdom lacks matchMedia / IntersectionObserver / rAF)

```ts
import '@testing-library/jest-dom'

// matchMedia (used by usePrefersReducedMotion)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

// IntersectionObserver (used by framer-motion whileInView / onViewportEnter)
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
// @ts-expect-error assign to global
global.IntersectionObserver = MockIntersectionObserver
```

- [ ] **Step 5: Add a smoke test to prove the runner works**

Create `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.ts
git commit -m "chore: set up single-page toolchain and vitest"
```

---

## Task 2: Design tokens, global CSS, and HTML/entry cleanup

**Files:**
- Rewrite: `src/index.css`
- Modify: `index.html`
- Modify: `src/main.tsx`

- [ ] **Step 1: Rewrite `src/index.css`** (dark-only tokens + keyframes + reduced-motion)

```css
@import "tailwindcss";

@theme {
  --color-bg: #08080a;
  --color-bg2: #0d0d10;
  --color-card: #131318;
  --color-hover: #1a1a20;

  --color-accent: #d4a853;
  --color-accent-hover: #e5b964;

  --color-tp: #ededf0;
  --color-ts: #9a9aa2;
  --color-tm: #63636c;
  --color-border: #232329;

  --font-sans: 'DM Sans', system-ui, -apple-system, sans-serif;
  --font-head: 'Space Grotesk', 'DM Sans', system-ui, sans-serif;
}

body {
  background-color: var(--color-bg);
  color: var(--color-tp);
  font-family: var(--font-sans);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
h1, h2, h3, h4 {
  font-family: var(--font-head);
  line-height: 1.05;
  letter-spacing: -0.02em;
}

@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(18deg); } }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-tm); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Tailwind v4 exposes these as utilities: `bg-bg`, `bg-card`, `text-tp`, `text-ts`, `text-tm`, `text-accent`, `border-border`, `font-head`, etc.

- [ ] **Step 2: Simplify `index.html`** — remove the react-router SPA-redirect script (single page has no client routes). Replace the block between `<!-- GitHub Pages SPA redirect restore -->` and its closing `</script>` (lines ~26–46) so that section is deleted entirely. Keep the charset, favicon, viewport, title, meta/OG/Twitter tags, and the Google Fonts links unchanged.

After edit, the `<head>` ends with the fonts `<link>` and the `<body>` is:

```html
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
```

- [ ] **Step 3: Rewrite `src/main.tsx`** (drop BrowserRouter)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Add a temporary placeholder `App.tsx` so the app compiles**

```tsx
export default function App() {
  return <div className="text-accent p-10 font-head">Rebuild in progress…</div>
}
```

- [ ] **Step 5: Verify dev server boots**

Run: `npm run dev` (then stop with Ctrl-C after it prints the local URL)
Expected: Vite starts with no compile errors; visiting the URL shows the gold "Rebuild in progress…" text on near-black.

- [ ] **Step 6: Commit**

```bash
git add src/index.css index.html src/main.tsx src/App.tsx
git commit -m "feat: dark-only design tokens and single-page entry"
```

---

## Task 3: Section registry (single source of truth)

**Files:**
- Create: `src/lib/sections.ts`
- Test: `src/lib/sections.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { SECTIONS, SECTION_IDS } from './sections'

describe('sections registry', () => {
  it('starts with hero and ends with contact', () => {
    expect(SECTIONS[0].id).toBe('hero')
    expect(SECTIONS[SECTIONS.length - 1].id).toBe('contact')
  })
  it('numbers the non-hero sections 01..05', () => {
    const numbered = SECTIONS.filter((s) => s.num)
    expect(numbered.map((s) => s.num)).toEqual(['01', '02', '03', '04', '05'])
  })
  it('exposes ids in order', () => {
    expect(SECTION_IDS).toEqual(['hero', 'about', 'work', 'photography', 'travel', 'contact'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sections.test.ts`
Expected: FAIL — cannot find module `./sections`.

- [ ] **Step 3: Implement `src/lib/sections.ts`**

```ts
export type SectionId = 'hero' | 'about' | 'work' | 'photography' | 'travel' | 'contact'

export interface SectionDef {
  id: SectionId
  label: string
  num?: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About', num: '01' },
  { id: 'work', label: 'Work', num: '02' },
  { id: 'photography', label: 'Photography', num: '03' },
  { id: 'travel', label: 'Travel', num: '04' },
  { id: 'contact', label: 'Contact', num: '05' },
]

export const SECTION_IDS: SectionId[] = SECTIONS.map((s) => s.id)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sections.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sections.ts src/lib/sections.test.ts
git commit -m "feat: section registry"
```

---

## Task 4: Data modules

**Files:**
- Keep: `src/data/projects.ts`, `src/data/photos.json` (already present — do not modify)
- Create: `src/data/about.ts`, `src/data/timeline.ts`, `src/data/travel.ts`, `src/data/socials.ts`

- [ ] **Step 1: Create `src/data/about.ts`**

```ts
export const statement =
  'What started as talking about innovations quickly turned into "why don\'t I just build this myself."'

export const bio =
  "I'm a Master's student in Business Information Systems who ships full-stack products, shoots street & travel photography, and games when the code compiles. I care about the seam where design, engineering and people meet."

export interface Fact {
  k: string
  v: string
}

export const facts: Fact[] = [
  { k: 'Based in', v: 'Basel 🇨🇭' },
  { k: 'Studying', v: 'MSc @ FHNW' },
  { k: 'Building with', v: 'React · Next · Spring' },
  { k: 'Shooting on', v: 'Fujifilm' },
]

export const languages = ['German', 'English', 'French']

export const techStack = [
  'React', 'TypeScript', 'Node.js', 'Spring Boot', 'Python', 'Tailwind CSS',
  'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Next.js', 'Figma',
]

export const roles = ['Developer', 'Photographer', 'MSc Student', 'Gamer']
```

- [ ] **Step 2: Create `src/data/timeline.ts`**

```ts
export interface TimelineItem {
  year: string
  title: string
  type: 'work' | 'edu'
  current: boolean
}

export const timeline: TimelineItem[] = [
  { year: '2025', title: 'Support Hero @ twio.tech', type: 'work', current: true },
  { year: '2024–2027', title: 'MSc Business Information Systems @ FHNW', type: 'edu', current: true },
  { year: '2024', title: 'Civil Service @ WBZ', type: 'work', current: false },
  { year: '2019–2023', title: 'BSc Business Information Technology @ FHNW', type: 'edu', current: false },
  { year: '2020', title: 'Exchange @ Erhvervsakademiet Aarhus', type: 'edu', current: false },
  { year: '2017–2018', title: 'Intern Supply Chain @ SBB Cargo International', type: 'work', current: false },
]
```

- [ ] **Step 3: Create `src/data/travel.ts`**

```ts
export interface Trip {
  country: string
  code: string
  city: string
  type: string
  year: string
}

export const trips: Trip[] = [
  { country: 'China', code: 'cn', city: 'Greater Bay Area', type: 'Field Trip', year: '2025' },
  { country: 'Denmark', code: 'dk', city: 'Aarhus', type: 'Exchange Semester', year: '2020' },
  { country: 'United Kingdom', code: 'gb', city: 'Cambridge', type: 'Language Stay', year: '2017' },
]
```

- [ ] **Step 4: Create `src/data/socials.ts`**

```ts
import { Mail, Linkedin, Github, Instagram, Coffee } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Social {
  icon: LucideIcon
  label: string
  href: string
}

export const socials: Social[] = [
  { icon: Mail, label: 'Email', href: 'mailto:jan.tobias.wilhelm@gmail.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/jan-wilhelm-1a235a197/' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/jantobiaswilhelm' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/tschaaaaan/' },
  { icon: Coffee, label: 'Ko-fi', href: 'https://ko-fi.com/lutem' },
]
```

- [ ] **Step 5: Verify types compile**

Run: `npx tsc -b --noEmit`
Expected: no errors from the new data files. (Pre-existing errors in old `src/pages`/`src/components` are expected and removed in the final task; if `tsc` is noisy, this step is satisfied as long as no error references the four new files.)

- [ ] **Step 6: Commit**

```bash
git add src/data/about.ts src/data/timeline.ts src/data/travel.ts src/data/socials.ts
git commit -m "feat: content data modules"
```

---

## Task 5: Derived stats

**Files:**
- Create: `src/data/stats.ts`
- Test: `src/data/stats.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { stats } from './stats'

describe('derived stats', () => {
  it('counts all projects', () => {
    expect(stats.projects).toBe(6)
  })
  it('counts active projects', () => {
    expect(stats.active).toBe(4)
  })
  it('counts photo frames', () => {
    expect(stats.frames).toBe(30)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/stats.test.ts`
Expected: FAIL — cannot find module `./stats`.

- [ ] **Step 3: Implement `src/data/stats.ts`**

```ts
import { projects } from './projects'
import photos from './photos.json'

export const stats = {
  projects: projects.length,
  active: projects.filter((p) => p.current).length,
  frames: (photos as unknown[]).length,
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/stats.test.ts`
Expected: PASS (3 tests). If `active` is not 4 or `frames` not 30, the data changed — update the expected numbers to match `projects.ts` / `photos.json` rather than hardcoding in the component.

- [ ] **Step 5: Commit**

```bash
git add src/data/stats.ts src/data/stats.test.ts
git commit -m "feat: stats derived from project and photo data"
```

---

## Task 6: usePrefersReducedMotion

**Files:**
- Create: `src/hooks/usePrefersReducedMotion.ts`
- Test: `src/hooks/usePrefersReducedMotion.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

describe('usePrefersReducedMotion', () => {
  it('returns false when the media query does not match (jsdom default)', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/usePrefersReducedMotion.test.tsx`
Expected: FAIL — cannot find module `./usePrefersReducedMotion`.

- [ ] **Step 3: Implement `src/hooks/usePrefersReducedMotion.ts`**

```ts
import { useEffect, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/usePrefersReducedMotion.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePrefersReducedMotion.ts src/hooks/usePrefersReducedMotion.test.tsx
git commit -m "feat: usePrefersReducedMotion hook"
```

---

## Task 7: useCountUp (with pure easing helper)

**Files:**
- Create: `src/hooks/useCountUp.ts`
- Test: `src/hooks/useCountUp.test.ts`

- [ ] **Step 1: Write the failing test** (test the pure frame math — deterministic)

```ts
import { describe, it, expect } from 'vitest'
import { easeOutCubic, countFrame } from './useCountUp'

describe('count-up math', () => {
  it('easeOutCubic is 0 at start and 1 at end', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })
  it('countFrame returns 0 at elapsed 0', () => {
    expect(countFrame(0, 1000, 30)).toBe(0)
  })
  it('countFrame returns the target at/after duration', () => {
    expect(countFrame(1000, 1000, 30)).toBe(30)
    expect(countFrame(5000, 1000, 30)).toBe(30)
  })
  it('countFrame is monotonic and within [0,target]', () => {
    const a = countFrame(250, 1000, 30)
    const b = countFrame(750, 1000, 30)
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(30)
    expect(b).toBeGreaterThanOrEqual(a)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useCountUp.test.ts`
Expected: FAIL — cannot find module `./useCountUp`.

- [ ] **Step 3: Implement `src/hooks/useCountUp.ts`**

```ts
import { useEffect, useRef, useState } from 'react'

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const countFrame = (elapsed: number, duration: number, target: number): number =>
  Math.round(easeOutCubic(Math.min(elapsed / duration, 1)) * target)

export function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const elapsed = ts - start
      setValue(countFrame(elapsed, duration, target))
      if (elapsed < duration) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, active, duration])

  return value
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useCountUp.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCountUp.ts src/hooks/useCountUp.test.ts
git commit -m "feat: useCountUp hook with pure easing helpers"
```

---

## Task 8: useTypewriter

**Files:**
- Create: `src/hooks/useTypewriter.ts`
- Test: `src/hooks/useTypewriter.test.tsx`

- [ ] **Step 1: Write the failing test** (fake timers advance the typing)

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

afterEach(() => vi.useRealTimers())

describe('useTypewriter', () => {
  it('starts empty and types characters of the first word over time', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTypewriter(['Dev'], { typeMs: 50 }))
    expect(result.current).toBe('')
    act(() => { vi.advanceTimersByTime(50) })
    expect(result.current).toBe('D')
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('Dev')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useTypewriter.test.tsx`
Expected: FAIL — cannot find module `./useTypewriter`.

- [ ] **Step 3: Implement `src/hooks/useTypewriter.ts`**

```ts
import { useEffect, useRef, useState } from 'react'

interface Options {
  typeMs?: number
  deleteMs?: number
  holdMs?: number
}

export function useTypewriter(words: string[], opts: Options = {}): string {
  const { typeMs = 85, deleteMs = 40, holdMs = 1500 } = opts
  const [text, setText] = useState('')
  const state = useRef({ wordIndex: 0, charCount: 0, deleting: false })

  useEffect(() => {
    if (words.length === 0) return
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const s = state.current
      const word = words[s.wordIndex]

      if (!s.deleting && s.charCount < word.length) {
        s.charCount++
        setText(word.slice(0, s.charCount))
        timer = setTimeout(tick, typeMs)
      } else if (!s.deleting && s.charCount === word.length) {
        s.deleting = true
        timer = setTimeout(tick, holdMs)
      } else if (s.deleting && s.charCount > 0) {
        s.charCount--
        setText(word.slice(0, s.charCount))
        timer = setTimeout(tick, deleteMs)
      } else {
        s.deleting = false
        s.wordIndex = (s.wordIndex + 1) % words.length
        timer = setTimeout(tick, typeMs)
      }
    }

    timer = setTimeout(tick, typeMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join('|'), typeMs, deleteMs, holdMs])

  return text
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useTypewriter.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTypewriter.ts src/hooks/useTypewriter.test.tsx
git commit -m "feat: useTypewriter hook"
```

---

## Task 9: useActiveSection (with pure selector)

**Files:**
- Create: `src/hooks/useActiveSection.ts`
- Test: `src/hooks/useActiveSection.test.ts`

- [ ] **Step 1: Write the failing test** (pure position-picking logic)

```ts
import { describe, it, expect } from 'vitest'
import { activeFromPositions } from './useActiveSection'

describe('activeFromPositions', () => {
  const threshold = 400
  it('returns the last section whose top is at or above the threshold', () => {
    const tops = [
      { id: 'hero', top: -500 },
      { id: 'about', top: 100 },
      { id: 'work', top: 900 },
    ]
    expect(activeFromPositions(tops, threshold)).toBe('about')
  })
  it('returns the first id when nothing has crossed yet', () => {
    const tops = [
      { id: 'hero', top: 800 },
      { id: 'about', top: 1600 },
    ]
    expect(activeFromPositions(tops, threshold)).toBe('hero')
  })
  it('returns empty string for no sections', () => {
    expect(activeFromPositions([], threshold)).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useActiveSection.test.ts`
Expected: FAIL — cannot find module `./useActiveSection`.

- [ ] **Step 3: Implement `src/hooks/useActiveSection.ts`**

```ts
import { useEffect, useState } from 'react'

export interface SectionTop {
  id: string
  top: number
}

export function activeFromPositions(tops: SectionTop[], threshold: number): string {
  let active = tops.length ? tops[0].id : ''
  for (const t of tops) {
    if (t.top <= threshold) active = t.id
  }
  return active
}

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.4
      const tops: SectionTop[] = ids.map((id) => {
        const el = document.getElementById(id)
        return { id, top: el ? el.getBoundingClientRect().top : Infinity }
      })
      setActive(activeFromPositions(tops, threshold))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])

  return active
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useActiveSection.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useActiveSection.ts src/hooks/useActiveSection.test.ts
git commit -m "feat: useActiveSection hook with pure selector"
```

---

## Task 10: Lenis smooth-scroll provider

**Files:**
- Create: `src/lib/smooth-scroll.tsx`

(No unit test — Lenis needs a real layout/rAF loop; verified in browser during App composition.)

- [ ] **Step 1: Implement `src/lib/smooth-scroll.tsx`**

```tsx
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface ScrollContext {
  scrollTo: (id: string) => void
}

const Ctx = createContext<ScrollContext>({ scrollTo: () => {} })

export const useSmoothScroll = () => useContext(Ctx)

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    lenisRef.current = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -60 })
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return <Ctx.Provider value={{ scrollTo }}>{children}</Ctx.Provider>
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit` (ignore errors only in old `src/pages`/`src/components` slated for deletion)
Expected: no errors referencing `smooth-scroll.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/smooth-scroll.tsx
git commit -m "feat: Lenis smooth-scroll provider"
```

---

## Task 11: Shared UI components

**Files:**
- Create: `src/components/ui/Reveal.tsx`, `SectionHeading.tsx`, `StatCounter.tsx`, `Marquee.tsx`, `MagneticButton.tsx`

- [ ] **Step 1: Create `src/components/ui/Reveal.tsx`**

```tsx
import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const variants: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.7, 0.2, 1] } },
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/SectionHeading.tsx`**

```tsx
export function SectionHeading({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-14">
      <span className="font-head text-accent text-sm font-medium">{num}</span>
      <h2 className="font-head font-bold text-[clamp(34px,6vw,64px)]">{title}</h2>
      <div className="flex-1 h-px bg-border self-center" />
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/StatCounter.tsx`**

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function StatCounter({ value, label }: { value: number; label: string }) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(false)
  const animated = useCountUp(value, active && !reduced)
  const display = reduced ? value : animated

  return (
    <motion.div onViewportEnter={() => setActive(true)} viewport={{ once: true }}>
      <div className="font-head text-4xl font-bold text-tp">{display}</div>
      <div className="text-xs text-tm tracking-[0.1em] uppercase">{label}</div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/Marquee.tsx`**

```tsx
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div
      className="overflow-hidden border-y border-border py-6 mt-16"
      style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)' }}
    >
      <div className="flex gap-11 w-max animate-[marquee_26s_linear_infinite]">
        {doubled.map((t, i) => (
          <span
            key={i}
            className={`font-head text-[22px] whitespace-nowrap ${i % 4 === 0 ? 'text-accent' : 'text-tm'}`}
          >
            {t} —
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/ui/MagneticButton.tsx`**

```tsx
import { useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function MagneticButton({ href, children }: { href: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduced = usePrefersReducedMotion()

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${
      (e.clientY - r.top - r.height / 2) * 0.4
    }px)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <a
      ref={ref}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="inline-flex items-center gap-2 px-7 py-4 border border-border rounded-full text-ts font-head text-sm transition-colors hover:text-accent hover:border-accent will-change-transform"
    >
      {children}
    </a>
  )
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc -b --noEmit` (ignore errors only in old files slated for deletion)
Expected: no errors in the five new `ui/` files.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Reveal.tsx src/components/ui/SectionHeading.tsx src/components/ui/StatCounter.tsx src/components/ui/Marquee.tsx src/components/ui/MagneticButton.tsx
git commit -m "feat: shared UI primitives"
```

---

## Task 12: Layout — Nav, ProgressDots, Footer

**Files:**
- Create: `src/components/layout/Nav.tsx`, `ProgressDots.tsx`, `Footer.tsx`

- [ ] **Step 1: Create `src/components/layout/Nav.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { SECTIONS, SECTION_IDS } from '../../lib/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useSmoothScroll } from '../../lib/smooth-scroll'

export function Nav() {
  const active = useActiveSection(SECTION_IDS)
  const { scrollTo } = useSmoothScroll()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? 'backdrop-blur-md bg-bg/70 border-b border-border' : ''
      }`}
    >
      <div className={`max-w-[1180px] mx-auto px-8 flex items-center justify-between transition-all ${scrolled ? 'py-3.5' : 'py-5'}`}>
        <button onClick={() => scrollTo('hero')} className="font-head font-bold text-[17px] tracking-wide">
          JAN WILHELM<span className="text-accent">.</span>
        </button>
        <div className="hidden md:flex gap-8 text-[13px]">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`transition-colors ${active === s.id ? 'text-tp' : 'text-ts hover:text-tp'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/ProgressDots.tsx`**

```tsx
import { SECTIONS, SECTION_IDS } from '../../lib/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useSmoothScroll } from '../../lib/smooth-scroll'

export function ProgressDots() {
  const active = useActiveSection(SECTION_IDS)
  const { scrollTo } = useSmoothScroll()

  return (
    <div className="hidden lg:flex fixed right-7 top-1/2 -translate-y-1/2 z-40 flex-col gap-3.5">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          aria-label={s.label}
          className={`group relative w-2.5 h-2.5 rounded-full border transition-all ${
            active === s.id ? 'bg-accent border-accent shadow-[0_0_12px_rgba(212,168,83,0.6)]' : 'border-tm'
          }`}
        >
          <span className="absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] text-ts opacity-0 group-hover:opacity-100 transition-opacity font-head">
            {s.label}
          </span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/layout/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-border py-10 text-center text-tm text-xs font-head tracking-wider">
      JAN WILHELM · BASEL, SWITZERLAND · BUILT WITH REACT + LENIS
    </footer>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b --noEmit` (ignore old-file errors)
Expected: no errors in the three new `layout/` files.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Nav.tsx src/components/layout/ProgressDots.tsx src/components/layout/Footer.tsx
git commit -m "feat: nav, progress dots, footer"
```

---

## Task 13: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Implement `src/components/sections/Hero.tsx`**

```tsx
import { Reveal } from '../ui/Reveal'
import { StatCounter } from '../ui/StatCounter'
import { useTypewriter } from '../../hooks/useTypewriter'
import { roles } from '../../data/about'
import { stats } from '../../data/stats'

const BASE = import.meta.env.BASE_URL

export function Hero() {
  const role = useTypewriter(roles)

  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* full-bleed darkened photo background */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${BASE}images/photos/DSCF9258.JPG`}
          alt=""
          className="w-full h-full object-cover opacity-30 contrast-105 scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(8,8,10,.55) 0%,rgba(8,8,10,.55) 45%,var(--color-bg) 100%),radial-gradient(70% 60% at 30% 40%,transparent,rgba(8,8,10,.35))',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-8 w-full">
        <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-16 items-center">
          <div>
            <Reveal className="font-head text-accent tracking-[0.3em] uppercase text-xs mb-7 flex items-center gap-3.5 before:content-[''] before:w-11 before:h-px before:bg-accent">
              Basel, Switzerland
            </Reveal>
            <Reveal>
              <h1 className="text-[clamp(56px,12vw,150px)] tracking-[-0.04em] mb-2">
                Jan<br />Wilhelm<span className="text-accent">.</span>
              </h1>
            </Reveal>
            <Reveal>
              <div className="text-[clamp(20px,3.4vw,34px)] font-head font-medium text-ts mb-10 h-[1.2em]">
                I'm a <span className="text-accent">{role}</span>
                <span className="animate-pulse">|</span>
              </div>
            </Reveal>
            <Reveal>
              <p className="max-w-[520px] text-ts text-[17px] mb-11">
                Full-stack developer, Fujifilm photographer and MSc student. I build digital
                products where design, engineering and people meet — and capture the moments in
                between.
              </p>
            </Reveal>
            <Reveal>
              <div className="flex gap-12 flex-wrap">
                <StatCounter value={stats.projects} label="Projects" />
                <StatCounter value={stats.active} label="Active now" />
                <StatCounter value={stats.frames} label="Frames" />
              </div>
            </Reveal>
          </div>

          <Reveal className="relative aspect-[4/5] rounded-[22px] overflow-hidden border border-border shadow-[0_34px_90px_rgba(0,0,0,0.55)] max-w-[300px] md:max-w-none order-first md:order-none">
            <img
              src={`${BASE}images/profile.png`}
              alt="Jan Wilhelm"
              className="w-full h-full object-cover grayscale contrast-105 scale-[1.02] transition-[filter] duration-700 hover:grayscale-0"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit` (ignore old-file errors)
Expected: no errors in `Hero.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: hero section"
```

---

## Task 14: About section

**Files:**
- Create: `src/components/sections/About.tsx`

- [ ] **Step 1: Implement `src/components/sections/About.tsx`**

```tsx
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Marquee } from '../ui/Marquee'
import { statement, bio, facts, techStack } from '../../data/about'

export function About() {
  return (
    <section id="about" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="01" title="About" />
      </Reveal>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <Reveal>
          <p className="font-head text-[clamp(22px,3vw,30px)] font-medium leading-[1.35] tracking-[-0.01em]">
            {statement.split('"')[0]}
            <span className="text-accent">"{statement.split('"')[1]}"</span>
          </p>
          <p className="text-ts mt-5">{bio}</p>
        </Reveal>
        <Reveal className="grid grid-cols-2 gap-[18px]">
          {facts.map((f) => (
            <div
              key={f.k}
              className="p-5 border border-border rounded-2xl bg-white/[0.015] transition-all hover:border-accent/35 hover:-translate-y-1"
            >
              <div className="text-[11px] text-tm tracking-[0.1em] uppercase mb-1.5">{f.k}</div>
              <div className="font-head text-[17px]">{f.v}</div>
            </div>
          ))}
        </Reveal>
      </div>
      <Reveal>
        <Marquee items={techStack} />
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit` (ignore old-file errors)
Expected: no errors in `About.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/About.tsx
git commit -m "feat: about section"
```

---

## Task 15: Work section + ProjectRow accordion

**Files:**
- Create: `src/components/sections/ProjectRow.tsx`, `src/components/sections/Work.tsx`
- Test: `src/components/sections/Work.test.tsx`

- [ ] **Step 1: Write the failing interaction test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Work } from './Work'

describe('Work accordion', () => {
  it('rows start collapsed', () => {
    render(<Work />)
    const buttons = screen.getAllByRole('button', { expanded: false })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('clicking a row expands it', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const first = screen.getAllByRole('button')[0]
    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
  })

  it('opening a second row collapses the first', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const rows = screen.getAllByRole('button')
    await user.click(rows[0])
    await user.click(rows[1])
    expect(rows[0]).toHaveAttribute('aria-expanded', 'false')
    expect(rows[1]).toHaveAttribute('aria-expanded', 'true')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/sections/Work.test.tsx`
Expected: FAIL — cannot find module `./Work`.

- [ ] **Step 3: Implement `src/components/sections/ProjectRow.tsx`**

```tsx
import { motion } from 'framer-motion'
import type { Project } from '../../data/projects'

const BASE = import.meta.env.BASE_URL

function links(p: Project): { label: string; href: string; primary: boolean }[] {
  const out: { label: string; href: string; primary: boolean }[] = []
  if (p.live) out.push({ label: 'Live', href: p.live, primary: true })
  if (p.github) out.push({ label: 'GitHub', href: p.github, primary: false })
  if (p.publication) out.push({ label: 'Publication', href: p.publication, primary: false })
  return out
}

export function ProjectRow({
  project,
  index,
  open,
  onToggle,
}: {
  project: Project
  index: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-t border-border last:border-b">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full grid grid-cols-[36px_1fr_auto] md:grid-cols-[60px_1fr_auto_24px] gap-7 items-center py-8 text-left transition-all ${
          open ? 'pl-3.5' : 'hover:pl-3.5'
        }`}
      >
        <span className="font-head text-tm text-sm">0{index + 1}</span>
        <span>
          <span className={`block font-head font-bold text-[clamp(22px,3vw,30px)] transition-colors ${open ? 'text-accent' : ''}`}>
            {project.title}
          </span>
          <span className="block text-ts text-sm mt-1">{project.tagline}</span>
        </span>
        <span className="hidden md:flex flex-col items-end gap-2">
          <span className="font-head text-accent text-[13px]">{project.year}</span>
          <span className="flex gap-1.5 flex-wrap justify-end max-w-[280px]">
            {project.stack.slice(0, 5).map((s) => (
              <span key={s} className="text-[11px] text-ts border border-border px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </span>
        </span>
        <span className={`hidden md:block text-tm text-xl transition-transform ${open ? 'rotate-90 text-accent' : ''}`}>›</span>
      </button>

      <motion.div initial={false} animate={{ height: open ? 'auto' : 0 }} style={{ overflow: 'hidden' }}>
        <div className="pb-10 md:pl-[88px] max-w-[820px]">
          <p className="text-ts mb-5">{project.description}</p>
          <h4 className="font-head text-xs tracking-[0.1em] uppercase text-tm mb-3">Highlights</h4>
          <ul className="flex flex-col gap-2 mb-6">
            {project.highlights.map((h) => (
              <li key={h} className="text-tp text-sm pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-accent">
                {h}
              </li>
            ))}
          </ul>
          {project.previews.length > 0 && (
            <div className="flex gap-3 mb-6 flex-wrap">
              {project.previews.map((pv) => (
                <img
                  key={pv.src}
                  src={`${BASE}${pv.src}`}
                  alt={pv.caption}
                  loading="lazy"
                  className="w-[180px] h-[110px] object-cover rounded-[10px] border border-border"
                />
              ))}
            </div>
          )}
          {links(project).length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {links(project).map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-head text-[13px] transition-colors ${
                    l.primary ? 'bg-accent text-[#111] hover:bg-accent-hover' : 'border border-border text-ts hover:border-accent hover:text-accent'
                  }`}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/components/sections/Work.tsx`**

```tsx
import { useState } from 'react'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectRow } from './ProjectRow'
import { projects } from '../../data/projects'

export function Work() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="work" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="02" title="Selected Work" />
      </Reveal>
      <div className="flex flex-col">
        {projects.map((p, i) => (
          <ProjectRow
            key={p.title}
            project={p}
            index={i}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/sections/Work.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/ProjectRow.tsx src/components/sections/Work.tsx src/components/sections/Work.test.tsx
git commit -m "feat: work section with inline-accordion project rows"
```

---

## Task 16: Photography section + Lightbox

**Files:**
- Create: `src/components/sections/Lightbox.tsx`, `src/components/sections/Photography.tsx`
- Test: `src/components/sections/Lightbox.test.tsx`

- [ ] **Step 1: Write the failing Lightbox test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lightbox } from './Lightbox'

const photos = [
  { src: 'a.jpg', alt: 'A' },
  { src: 'b.jpg', alt: 'B' },
  { src: 'c.jpg', alt: 'C' },
]

describe('Lightbox', () => {
  it('renders nothing when index is null', () => {
    const { container } = render(<Lightbox photos={photos} index={null} onClose={() => {}} onChange={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the current frame number', () => {
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByText('01')).toBeInTheDocument()
  })

  it('advances with the next button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={onChange} />)
    await user.click(screen.getByLabelText('Next photo'))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('wraps to the last frame when going previous from the first', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={onChange} />)
    await user.click(screen.getByLabelText('Previous photo'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Lightbox photos={photos} index={1} onClose={onClose} onChange={() => {}} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/sections/Lightbox.test.tsx`
Expected: FAIL — cannot find module `./Lightbox`.

- [ ] **Step 3: Implement `src/components/sections/Lightbox.tsx`**

```tsx
import { useEffect, useRef } from 'react'

export interface Frame {
  src: string
  alt: string
}

export function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Frame[]
  index: number | null
  onClose: () => void
  onChange: (next: number) => void
}) {
  const wrap = (i: number) => (i + photos.length) % photos.length
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (index === null) return
    // basic focus management: move focus into the dialog on open
    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onChange(wrap(index - 1))
      if (e.key === 'ArrowRight') onChange(wrap(index + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  if (index === null) return null
  const frame = photos[index]

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] bg-[rgba(5,5,7,0.96)] backdrop-blur-md flex items-center justify-center outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button aria-label="Close" onClick={onClose} className="absolute top-5 right-7 text-ts text-2xl hover:text-accent">
        ✕
      </button>
      <button
        aria-label="Previous photo"
        onClick={() => onChange(wrap(index - 1))}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ts text-[46px] p-4 hover:text-accent select-none"
      >
        ‹
      </button>
      <img src={frame.src} alt={frame.alt} className="max-w-[90vw] max-h-[84vh] object-contain rounded-[10px]" />
      <button
        aria-label="Next photo"
        onClick={() => onChange(wrap(index + 1))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ts text-[46px] p-4 hover:text-accent select-none"
      >
        ›
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ts text-[13px] font-head tracking-wide">
        Frame <b className="text-accent">{String(index + 1).padStart(2, '0')}</b> / {String(photos.length).padStart(2, '0')}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/sections/Lightbox.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Implement `src/components/sections/Photography.tsx`**

```tsx
import { useState } from 'react'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Lightbox, type Frame } from './Lightbox'
import photosData from '../../data/photos.json'

const BASE = import.meta.env.BASE_URL
const photos: Frame[] = (photosData as { src: string; alt: string }[]).map((p) => ({
  src: `${BASE}${p.src.slice(1)}`,
  alt: p.alt,
}))

export function Photography() {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <section id="photography" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="03" title="Photography" />
      </Reveal>
      <Reveal className="[columns:2] sm:[columns:3] lg:[columns:4] [column-gap:12px]">
        {photos.map((p, i) => (
          <figure
            key={p.src}
            onClick={() => setIndex(i)}
            className="[break-inside:avoid] mb-3 overflow-hidden rounded-[14px] border border-border relative cursor-pointer group"
          >
            <img
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="w-full block transition-transform duration-700 group-hover:scale-[1.06]"
            />
          </figure>
        ))}
      </Reveal>
      <Lightbox photos={photos} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
    </section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Lightbox.tsx src/components/sections/Lightbox.test.tsx src/components/sections/Photography.tsx
git commit -m "feat: photography section with fullscreen lightbox"
```

---

## Task 17: Travel section

**Files:**
- Create: `src/components/sections/Travel.tsx`

- [ ] **Step 1: Implement `src/components/sections/Travel.tsx`**

```tsx
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { trips } from '../../data/travel'

export function Travel() {
  return (
    <section id="travel" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="04" title="Travel" />
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {trips.map((t) => (
          <Reveal
            key={t.country}
            className="p-7 border border-border rounded-[18px] bg-white/[0.015] transition-all hover:border-accent/35 hover:-translate-y-1 relative"
          >
            <span className="absolute top-[26px] right-[26px] font-head text-tm text-[13px]">{t.year}</span>
            <img
              src={`https://flagcdn.com/w80/${t.code}.png`}
              alt={t.country}
              className="w-[42px] h-[29px] rounded-[5px] object-cover mb-[18px] border border-border"
            />
            <h3 className="text-[26px] mb-1">{t.country}</h3>
            <div className="text-ts text-sm mb-[18px]">{t.city}</div>
            <div className="font-head text-xs text-accent tracking-[0.08em] uppercase">{t.type}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit` (ignore old-file errors)
Expected: no errors in `Travel.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Travel.tsx
git commit -m "feat: travel section"
```

---

## Task 18: Contact section

**Files:**
- Create: `src/components/sections/Contact.tsx`

- [ ] **Step 1: Implement `src/components/sections/Contact.tsx`**

```tsx
import { Reveal } from '../ui/Reveal'
import { MagneticButton } from '../ui/MagneticButton'
import { socials } from '../../data/socials'

export function Contact() {
  return (
    <section id="contact" className="py-40 max-w-[1180px] mx-auto px-8 text-center">
      <Reveal>
        <span className="font-head text-accent text-sm font-medium">05</span>
      </Reveal>
      <Reveal>
        <h2 className="text-[clamp(44px,9vw,120px)] tracking-[-0.04em] my-6">
          Let's build<br />something<span className="text-accent">.</span>
        </h2>
      </Reveal>
      <Reveal>
        <p className="text-ts max-w-[460px] mx-auto mb-11 text-[17px]">
          Open to collaborations, freelance work and good conversations.
        </p>
      </Reveal>
      <Reveal className="flex justify-center gap-4 flex-wrap">
        {socials.map((s) => (
          <MagneticButton key={s.label} href={s.href}>
            <s.icon size={16} />
            {s.label}
          </MagneticButton>
        ))}
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit` (ignore old-file errors)
Expected: no errors in `Contact.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Contact.tsx
git commit -m "feat: contact section"
```

---

## Task 19: App shell composition

**Files:**
- Rewrite: `src/App.tsx`

- [ ] **Step 1: Implement `src/App.tsx`**

```tsx
import { useEffect } from 'react'
import { SmoothScrollProvider } from './lib/smooth-scroll'
import { Nav } from './components/layout/Nav'
import { ProgressDots } from './components/layout/ProgressDots'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Work } from './components/sections/Work'
import { Photography } from './components/sections/Photography'
import { Travel } from './components/sections/Travel'
import { Contact } from './components/sections/Contact'

export default function App() {
  useEffect(() => {
    document.title = 'Jan Wilhelm — Developer & Photographer'
  }, [])

  return (
    <SmoothScrollProvider>
      {/* fixed ambient background */}
      <div
        className="fixed inset-0 -z-10 animate-[hue_18s_ease-in-out_infinite_alternate]"
        style={{
          background:
            'radial-gradient(60% 50% at 70% 20%,rgba(212,168,83,.10),transparent 60%),radial-gradient(50% 40% at 20% 80%,rgba(120,90,200,.07),transparent 60%),var(--color-bg)',
        }}
      />
      <Nav />
      <ProgressDots />
      <main>
        <Hero />
        <About />
        <Work />
        <Photography />
        <Travel />
        <Contact />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all suites PASS (sections, stats, hooks, Work, Lightbox, smoke).

- [ ] **Step 3: Browser verification**

Run: `npm run dev`, open the local URL, and confirm:
- Page scrolls with Lenis momentum (smooth, slightly weighted).
- Nav condenses after scrolling; active link + active side-dot track the current section.
- Clicking a nav link or dot glides to that section.
- Hero: photo background visible + darkened, typewriter cycles roles, stats count up once.
- Work rows expand/collapse inline; only one open at a time; links open in new tabs.
- Photography: clicking a photo opens the lightbox; ‹ ›, ←/→, and Esc all work; counter updates.
- Travel cards and Contact magnetic buttons render.
Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: compose single-page app shell"
```

---

## Task 20: Remove old code, reduced-motion pass, build & deploy check

**Files:**
- Delete: old pages/layouts/components/hooks/data listed in File Structure
- Modify: none (verification task)

- [ ] **Step 1: Delete the superseded multi-page files**

```bash
git rm src/pages/HubPage.tsx src/pages/WorkPage.tsx src/pages/PhotographyPage.tsx src/pages/AboutPage.tsx
git rm src/layouts/RootLayout.tsx
git rm src/components/Hero.tsx src/components/Photography.tsx src/components/Projects.tsx src/components/Skills.tsx src/components/Travel.tsx src/components/Contact.tsx
git rm src/components/ui/PageTransition.tsx src/components/ui/PreviewCard.tsx src/components/ui/Footer.tsx
git rm src/data/contact.ts src/data/skills.ts
git rm src/hooks/useCountUp.ts src/hooks/useTypewriter.ts
git rm public/404.html
```

(If any path no longer exists, skip it — the goal is that only the new structure remains. `src/components/ui/Footer.tsx` is the old one; the new footer lives at `src/components/layout/Footer.tsx`.)

- [ ] **Step 2: Confirm nothing imports deleted modules**

Run: `git grep -nE "pages/|layouts/RootLayout|react-router|data/skills|data/contact|react-simple-maps" -- src` 
Expected: no matches. If any appear, fix the importing file.

- [ ] **Step 3: Full type-check now that old files are gone**

Run: `npx tsc -b --noEmit`
Expected: zero errors (the old error sources are deleted).

- [ ] **Step 4: Reduced-motion verification**

In the browser (`npm run dev`), enable OS "reduce motion" (or DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce`) and reload. Confirm:
- No Lenis smoothing (native jump scroll), no marquee movement, stats show final values immediately, reveals show content without transform. Page is fully readable.

- [ ] **Step 5: Production build**

Run: `npm run build`
Expected: `tsc -b` passes and `vite build` completes; `dist/` produced with `base` `/Portfolio/`.

- [ ] **Step 6: Preview the production build**

Run: `npm run preview`, open the served URL, click through all sections + lightbox once more. Stop the server when done.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove legacy multi-page structure; single-page build green"
```

- [ ] **Step 8: (Optional) Deploy**

The existing `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main`. Pushing these commits triggers deployment. Confirm with the user before pushing.

---

## Notes on 21st.dev

The spec calls for 21st.dev components "where they fit." This plan implements every piece directly (with framer-motion) so it is self-contained and testable without network fetches. During or after the build, any of these can be swapped for a polished 21st.dev registry component without changing the data or section structure — most natural candidates: the **Marquee**, the **MagneticButton**, and the hero **background/gradient**. Treat that as an optional enhancement pass, verified in the browser, not a blocker.
