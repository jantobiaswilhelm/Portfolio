# Photography Pipeline and Justified Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Every task must run `npm run build`, not just `npm test`.** The build runs `tsc -b`,
> and the test runner does not typecheck. A TS error introduced in Task 2 went unnoticed
> for three tasks because those tasks only ran the suite. `npm test` green is not
> sufficient evidence that a task is done.

**Goal:** Replace the hand-maintained photo set with a build-time pipeline that emits responsive derivatives and an EXIF-backed manifest, and replace the CSS-columns masonry with a keyboard-accessible justified-rows grid.

**Architecture:** A Node script (`scripts/photos.mjs`) reads originals from a gitignored `photos/` directory, emits AVIF/WebP/JPEG derivatives at four widths into `public/images/photos/`, and writes `src/data/photos.json`. All pure logic lives in `scripts/photos-lib.mjs` so it can be unit tested without invoking sharp. The grid computes its layout client-side from a pure function in `src/lib/justified-layout.ts`, using intrinsic dimensions from the manifest so no image load is needed to reserve space.

**Tech Stack:** Node 20+ ESM, sharp, exifr, React 19, TypeScript, Tailwind v4, Vitest + Testing Library, Lenis.

**Spec:** `docs/superpowers/specs/2026-09-13-photography-pipeline-design.md`

---

## File Structure

**Created:**
- `scripts/photos-lib.mjs` - pure logic: folder parsing, alt resolution, sorting, manifest assembly. No I/O, no sharp.
- `scripts/photos-lib.test.mjs` - unit tests for the above.
- `scripts/photos.mjs` - I/O shell: walks `photos/`, calls sharp and exifr, writes derivatives and the manifest.
- `src/lib/justified-layout.ts` - pure `layoutRows()` function. No React, no DOM.
- `src/lib/justified-layout.test.ts` - unit tests for the layout maths.
- `src/data/photos-manifest.ts` - typed accessor over `photos.json`. Single place that knows the manifest shape.
- `src/components/sections/Photography.test.tsx` - grid behaviour and accessibility tests.
- `photos/.gitkeep` - keeps the (otherwise gitignored) source directory in the tree.

**Modified:**
- `package.json` - add `photos` script, add `sharp` and `exifr` devDependencies.
- `.gitignore` - ignore `photos/*` but not `.gitkeep`.
- `src/test/setup.ts` - add a `ResizeObserver` mock.
- `src/data/stats.ts` - read `.photos` off the manifest object instead of treating it as an array.
- `src/data/stats.test.ts` - stop asserting a hardcoded 30.
- `src/components/sections/Photography.tsx` - full rewrite to justified rows.
- `src/components/sections/Lightbox.tsx` - metadata line, scroll lock, derivative source.
- `src/components/sections/Lightbox.test.tsx` - update to the new `Frame` type.
- `src/lib/smooth-scroll.tsx` - expose `setScrollLocked`.
- `src/components/sections/Hero.tsx` - consume `heroId` and responsive sources.

**Deleted:**
- `public/images/photos/*` - the current 30 originals. Replaced by generated output.

---

## Task 1: Justified layout function

**Files:**
- Create: `src/lib/justified-layout.ts`
- Test: `src/lib/justified-layout.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/justified-layout.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { layoutRows } from './justified-layout'

const CONTAINER = 1200
const TARGET = 300
const GUTTER = 8

describe('layoutRows', () => {
  it('returns nothing for an empty set', () => {
    expect(layoutRows([], CONTAINER, TARGET, GUTTER)).toEqual([])
  })

  it('returns nothing when the container has no width', () => {
    expect(layoutRows([1.5, 1.5], 0, TARGET, GUTTER)).toEqual([])
  })

  it('fills every full row to exactly the container width', () => {
    const aspects = [1.5, 1.5, 0.66, 1.5, 1.5, 0.66, 1.5, 1.5]
    const rows = layoutRows(aspects, CONTAINER, TARGET, GUTTER)
    const full = rows.slice(0, -1)
    expect(full.length).toBeGreaterThan(0)
    for (const row of full) {
      const used =
        row.tiles.reduce((sum, t) => sum + t.width, 0) + GUTTER * (row.tiles.length - 1)
      expect(used).toBeCloseTo(CONTAINER, 1)
    }
  })

  it('does not stretch the last row', () => {
    const rows = layoutRows([1.5, 1.5, 0.66, 1.5, 1.5], CONTAINER, TARGET, GUTTER)
    const last = rows[rows.length - 1]
    const used =
      last.tiles.reduce((sum, t) => sum + t.width, 0) + GUTTER * (last.tiles.length - 1)
    expect(used).toBeLessThan(CONTAINER)
    expect(last.height).toBeLessThanOrEqual(TARGET)
  })

  it('never distorts an aspect ratio', () => {
    const aspects = [1.5, 0.66, 2.4, 1.0, 1.5]
    const rows = layoutRows(aspects, CONTAINER, TARGET, GUTTER)
    for (const row of rows) {
      for (const tile of row.tiles) {
        expect(tile.width / tile.height).toBeCloseTo(aspects[tile.index], 5)
      }
    }
  })

  it('scales a single oversized photo down to fit', () => {
    const rows = layoutRows([5], CONTAINER, TARGET, GUTTER)
    expect(rows).toHaveLength(1)
    expect(rows[0].tiles[0].width).toBeCloseTo(CONTAINER, 1)
    expect(rows[0].height).toBeLessThan(TARGET)
  })

  it('leaves a single small photo at the target height', () => {
    const rows = layoutRows([1.5], CONTAINER, TARGET, GUTTER)
    expect(rows[0].height).toBeCloseTo(TARGET, 5)
  })

  it('returns every photo exactly once, in order', () => {
    const aspects = [1.5, 0.66, 2.4, 1.0, 1.5, 1.5, 0.8]
    const rows = layoutRows(aspects, CONTAINER, TARGET, GUTTER)
    const seen = rows.flatMap((r) => r.tiles.map((t) => t.index))
    expect(seen).toEqual(aspects.map((_, i) => i))
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- justified-layout`
Expected: FAIL, `Failed to resolve import "./justified-layout"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/justified-layout.ts`:

```ts
export interface LayoutTile {
  /** Index into the original aspects array. */
  index: number
  width: number
  height: number
}

export interface LayoutRow {
  height: number
  tiles: LayoutTile[]
}

/**
 * Lays photos out in rows that fill the container width exactly, preserving
 * every aspect ratio. The final row is never stretched: it keeps the target
 * height unless the row would overflow, in which case it scales down to fit.
 *
 * Pure, DOM-free and dependency-free so it can be unit tested directly.
 */
export function layoutRows(
  aspects: number[],
  containerWidth: number,
  targetHeight: number,
  gutter: number,
): LayoutRow[] {
  if (aspects.length === 0 || containerWidth <= 0 || targetHeight <= 0) return []

  const build = (indices: number[], aspectSum: number, justify: boolean): LayoutRow => {
    const available = containerWidth - gutter * (indices.length - 1)
    const fitted = available / aspectSum
    const height = justify ? fitted : Math.min(targetHeight, fitted)
    return {
      height,
      tiles: indices.map((index) => ({
        index,
        width: height * aspects[index],
        height,
      })),
    }
  }

  const rows: LayoutRow[] = []
  let current: number[] = []
  let aspectSum = 0

  for (let i = 0; i < aspects.length; i++) {
    current.push(i)
    aspectSum += aspects[i]
    const naturalWidth = targetHeight * aspectSum + gutter * (current.length - 1)
    if (naturalWidth >= containerWidth) {
      rows.push(build(current, aspectSum, true))
      current = []
      aspectSum = 0
    }
  }

  if (current.length > 0) rows.push(build(current, aspectSum, false))

  return rows
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- justified-layout`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/justified-layout.ts src/lib/justified-layout.test.ts
git commit -m "feat: justified-rows layout function"
```

---

## Task 2: ResizeObserver mock in the test setup

The grid observes its container width. jsdom has no `ResizeObserver`, so the Photography test in Task 7 would throw without this.

**Files:**
- Modify: `src/test/setup.ts`

- [ ] **Step 1: Add the mock**

Append to `src/test/setup.ts`, after the existing `IntersectionObserver` block:

```ts
// ResizeObserver (used by the justified photo grid to track container width)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error assign to global
global.ResizeObserver = MockResizeObserver
```

- [ ] **Step 2: Run the full suite to confirm nothing regressed**

Run: `npm test`
Expected: PASS, 33 tests (25 existing + 8 from Task 1).

- [ ] **Step 3: Commit**

```bash
git add src/test/setup.ts
git commit -m "test: mock ResizeObserver in the vitest setup"
```

---

## Task 3: Pure script logic

All the logic worth testing, separated from sharp and the filesystem.

**Files:**
- Create: `scripts/photos-lib.mjs`
- Test: `scripts/photos-lib.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `scripts/photos-lib.test.mjs`:

```js
import { describe, it, expect } from 'vitest'
import {
  WIDTHS,
  parseFolder,
  resolveAlt,
  sortPhotos,
  buildManifest,
} from './photos-lib.mjs'

describe('parseFolder', () => {
  it('splits a trailing four-digit year off the place', () => {
    expect(parseFolder('venice-2023')).toEqual({ place: 'Venice', year: '2023' })
  })

  it('title-cases a multi-word place', () => {
    expect(parseFolder('greater-bay-area-2025')).toEqual({
      place: 'Greater Bay Area',
      year: '2025',
    })
  })

  it('leaves the year undefined when the folder has none', () => {
    expect(parseFolder('basel')).toEqual({ place: 'Basel', year: undefined })
  })

  it('does not treat a bare year as a year', () => {
    expect(parseFolder('2023')).toEqual({ place: '2023', year: undefined })
  })
})

describe('resolveAlt', () => {
  it('defaults to place and year', () => {
    expect(resolveAlt('DSCF1.JPG', {}, 'Venice', '2023')).toEqual({
      alt: 'Venice, 2023',
      altIsDefault: true,
    })
  })

  it('defaults to place alone when there is no year', () => {
    expect(resolveAlt('DSCF1.JPG', {}, 'Basel', undefined)).toEqual({
      alt: 'Basel',
      altIsDefault: true,
    })
  })

  it('uses an override and flags it as not default', () => {
    const overrides = { 'DSCF1.JPG': 'Canal boats moored at dusk' }
    expect(resolveAlt('DSCF1.JPG', overrides, 'Venice', '2023')).toEqual({
      alt: 'Canal boats moored at dusk',
      altIsDefault: false,
    })
  })

  it('ignores a blank override', () => {
    expect(resolveAlt('DSCF1.JPG', { 'DSCF1.JPG': '   ' }, 'Venice', '2023')).toEqual({
      alt: 'Venice, 2023',
      altIsDefault: true,
    })
  })
})

describe('sortPhotos', () => {
  it('orders by capture date, newest first', () => {
    const photos = [
      { id: 'a', takenAt: '2021-01-01T00:00:00.000Z' },
      { id: 'b', takenAt: '2025-01-01T00:00:00.000Z' },
      { id: 'c', takenAt: '2023-01-01T00:00:00.000Z' },
    ]
    expect(sortPhotos(photos).map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })

  it('puts undated photos last and breaks ties by id', () => {
    const photos = [
      { id: 'z' },
      { id: 'b', takenAt: '2025-01-01T00:00:00.000Z' },
      { id: 'a' },
    ]
    expect(sortPhotos(photos).map((p) => p.id)).toEqual(['b', 'a', 'z'])
  })
})

describe('buildManifest', () => {
  const photos = [
    { id: 'venice-2023/DSCF1', w: 6240, h: 4160, alt: 'Venice, 2023', altIsDefault: true },
  ]

  it('produces the documented shape', () => {
    const manifest = buildManifest(photos, 'venice-2023/DSCF1')
    expect(manifest.widths).toEqual(WIDTHS)
    expect(manifest.heroId).toBe('venice-2023/DSCF1')
    expect(manifest.photos).toHaveLength(1)
  })

  it('drops a heroId that names no known photo', () => {
    expect(buildManifest(photos, 'nope/missing').heroId).toBeNull()
  })

  it('returns an empty manifest for no photos without throwing', () => {
    const manifest = buildManifest([], null)
    expect(manifest.photos).toEqual([])
    expect(manifest.heroId).toBeNull()
    expect(manifest.widths).toEqual(WIDTHS)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- photos-lib`
Expected: FAIL, cannot resolve `./photos-lib.mjs`.

- [ ] **Step 3: Write the implementation**

Create `scripts/photos-lib.mjs`:

```js
/**
 * Pure logic for the photo pipeline. No filesystem access, no sharp.
 * Kept separate from scripts/photos.mjs so it can be unit tested directly.
 */

export const WIDTHS = [400, 800, 1200, 1600]

export const FORMATS = [
  { ext: 'avif', options: { quality: 50 } },
  { ext: 'webp', options: { quality: 74 } },
  { ext: 'jpg', options: { quality: 80, mozjpeg: true } },
]

/**
 * "venice-2023" -> { place: "Venice", year: "2023" }
 * "greater-bay-area-2025" -> { place: "Greater Bay Area", year: "2025" }
 * "basel" -> { place: "Basel", year: undefined }
 */
export function parseFolder(folder) {
  const parts = folder.split('-').filter(Boolean)
  let year
  if (parts.length > 1 && /^\d{4}$/.test(parts[parts.length - 1])) {
    year = parts.pop()
  }
  const place = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  return { place, year }
}

/**
 * EXIF cannot describe a photograph, so the default is only place and year.
 * A non-blank entry in the folder's captions.json wins and clears the flag.
 */
export function resolveAlt(fileName, overrides, place, year) {
  const override = overrides?.[fileName]
  if (typeof override === 'string' && override.trim()) {
    return { alt: override.trim(), altIsDefault: false }
  }
  return { alt: year ? `${place}, ${year}` : place, altIsDefault: true }
}

/** Newest first. Undated photos sort last, ties broken by id for determinism. */
export function sortPhotos(photos) {
  return [...photos].sort((a, b) => {
    if (a.takenAt && b.takenAt) {
      if (a.takenAt !== b.takenAt) return a.takenAt < b.takenAt ? 1 : -1
      return a.id < b.id ? -1 : 1
    }
    if (a.takenAt) return -1
    if (b.takenAt) return 1
    return a.id < b.id ? -1 : 1
  })
}

export function buildManifest(photos, heroId) {
  const sorted = sortPhotos(photos)
  const known = new Set(sorted.map((p) => p.id))
  return {
    widths: WIDTHS,
    heroId: heroId && known.has(heroId) ? heroId : null,
    photos: sorted,
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- photos-lib`
Expected: PASS, 13 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/photos-lib.mjs scripts/photos-lib.test.mjs
git commit -m "feat: pure logic for the photo pipeline"
```

---

## Task 4: The pipeline script

**Files:**
- Create: `scripts/photos.mjs`
- Create: `photos/.gitkeep`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install the dependencies**

Run:

```bash
npm install --save-dev sharp exifr
```

Expected: both appear under `devDependencies` in `package.json`.

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"` after `"build"`:

```json
    "photos": "node scripts/photos.mjs",
```

- [ ] **Step 3: Ignore the originals**

Append to `.gitignore`:

```
# Photo originals. Only generated derivatives under public/images/photos
# and the manifest at src/data/photos.json are committed.
photos/*
!photos/.gitkeep
```

- [ ] **Step 4: Create the source directory placeholder**

```bash
mkdir -p photos && touch photos/.gitkeep
```

- [ ] **Step 5: Write the script**

Create `scripts/photos.mjs`:

```js
#!/usr/bin/env node
/**
 * Reads originals from photos/<folder>/, emits responsive derivatives into
 * public/images/photos/<folder>/, and writes the manifest to src/data/photos.json.
 *
 * Run with: npm run photos
 *
 * Incremental: a file is reprocessed only when its derivatives are missing or
 * older than the original. Safe to run repeatedly.
 */
import { readdir, stat, mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import exifr from 'exifr'
import { WIDTHS, FORMATS, parseFolder, resolveAlt, buildManifest } from './photos-lib.mjs'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'photos')
const OUT_DIR = path.join(ROOT, 'public', 'images', 'photos')
const MANIFEST = path.join(ROOT, 'src', 'data', 'photos.json')
const IMAGE_RE = /\.(jpe?g|png|tiff?)$/i

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function mtimeOf(file) {
  try {
    return (await stat(file)).mtimeMs
  } catch {
    return 0
  }
}

/** True when any derivative is missing or older than the original. */
async function isStale(originalPath, outDir, name) {
  const original = await mtimeOf(originalPath)
  for (const width of WIDTHS) {
    for (const { ext } of FORMATS) {
      const derivative = path.join(outDir, `${name}-${width}.${ext}`)
      if ((await mtimeOf(derivative)) < original) return true
    }
  }
  return false
}

async function makeLqip(pipeline) {
  const buf = await pipeline
    .clone()
    .resize(20, null, { fit: 'inside' })
    .webp({ quality: 30 })
    .toBuffer()
  return `data:image/webp;base64,${buf.toString('base64')}`
}

async function processFile(folder, fileName, place, year, overrides) {
  const originalPath = path.join(SRC_DIR, folder, fileName)
  const outDir = path.join(OUT_DIR, folder)
  const name = path.parse(fileName).name
  const id = `${folder}/${name}`

  await mkdir(outDir, { recursive: true })

  const pipeline = sharp(originalPath).rotate() // honour EXIF orientation
  const meta = await pipeline.metadata()
  // .rotate() swaps width/height for 90/270-degree orientations
  const swapped = meta.orientation !== undefined && meta.orientation >= 5
  const w = swapped ? meta.height : meta.width
  const h = swapped ? meta.width : meta.height

  if (!w || !h) {
    console.warn(`  skipped ${id}: could not read dimensions`)
    return null
  }

  const stale = await isStale(originalPath, outDir, name)
  if (stale) {
    for (const width of WIDTHS) {
      if (width > w) continue // never upscale
      const resized = pipeline.clone().resize(width, null, { fit: 'inside' })
      for (const { ext, options } of FORMATS) {
        const target = path.join(outDir, `${name}-${width}.${ext}`)
        const format = ext === 'jpg' ? 'jpeg' : ext
        await resized.clone()[format](options).toFile(target)
      }
    }
  }

  const exif = (await exifr.parse(originalPath, {
    pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ISO', 'DateTimeOriginal'],
  })) ?? {}

  const camera = [exif.Make, exif.Model].filter(Boolean).join(' ').trim() || null
  const { alt, altIsDefault } = resolveAlt(fileName, overrides, place, year)

  return {
    id,
    w,
    h,
    alt,
    altIsDefault,
    place,
    year: year ?? null,
    camera,
    lens: exif.LensModel ?? null,
    focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : null,
    aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
    iso: exif.ISO ?? null,
    takenAt: exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : undefined,
    lqip: await makeLqip(pipeline),
    regenerated: stale,
  }
}

async function main() {
  let folders = []
  try {
    const entries = await readdir(SRC_DIR, { withFileTypes: true })
    folders = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    console.warn(`photos/ not found. Writing an empty manifest.`)
  }

  const hero = await readJson(path.join(SRC_DIR, 'hero.json'), null)
  const photos = []
  let regenerated = 0

  for (const folder of folders) {
    const { place, year } = parseFolder(folder)
    const overrides = await readJson(path.join(SRC_DIR, folder, 'captions.json'), {})
    const files = (await readdir(path.join(SRC_DIR, folder))).filter((f) => IMAGE_RE.test(f))

    for (const fileName of files.sort()) {
      const photo = await processFile(folder, fileName, place, year, overrides)
      if (!photo) continue
      if (photo.regenerated) regenerated++
      delete photo.regenerated
      photos.push(photo)
    }
  }

  const manifest = buildManifest(photos, hero?.id ?? null)
  await mkdir(path.dirname(MANIFEST), { recursive: true })
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  const defaults = photos.filter((p) => p.altIsDefault).length
  console.log(`\n${photos.length} photo(s), ${regenerated} regenerated.`)
  if (hero?.id && !manifest.heroId) {
    console.warn(`hero.json names "${hero.id}", which is not in the set. Hero will fall back.`)
  }
  if (!manifest.heroId) console.warn(`No hero photo set. Add photos/hero.json to choose one.`)
  if (defaults > 0) {
    console.warn(
      `${defaults} photo(s) still use the default "<Place>, <Year>" alt text. ` +
        `Add descriptions in photos/<folder>/captions.json.`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 6: Verify it handles an empty directory without throwing**

Run: `npm run photos`
Expected: exits 0, prints `0 photo(s), 0 regenerated.` plus the no-hero warning, and writes `src/data/photos.json` containing `{"widths":[400,800,1200,1600],"heroId":null,"photos":[]}`.

- [ ] **Step 7: Verify it processes real photos**

Copy two or three originals into `photos/test-2024/`, then run `npm run photos` twice.

Expected on the first run: derivatives appear under `public/images/photos/test-2024/`, and the count of regenerated files matches the number of photos.
Expected on the second run: same photo count, `0 regenerated`. This is the idempotency check.

Then remove the scratch folder: `rm -rf photos/test-2024 public/images/photos/test-2024`

- [ ] **Step 8: Commit**

```bash
git add scripts/photos.mjs photos/.gitkeep package.json package-lock.json .gitignore
git commit -m "feat: build-time photo pipeline with responsive derivatives and EXIF manifest"
```

---

## Task 5: Typed manifest accessor and stats plumbing

`photos.json` changes from a bare array to an object, which breaks `stats.ts`. This task introduces the single typed accessor everything else imports.

**Files:**
- Create: `src/data/photos-manifest.ts`
- Modify: `src/data/stats.ts`
- Modify: `src/data/stats.test.ts`

- [ ] **Step 1: Write the failing test**

Replace the photo assertion in `src/data/stats.test.ts`. The old test hardcoded 30, which is wrong now that the set is being recurated. Replace the whole file:

```ts
import { describe, it, expect } from 'vitest'
import { stats } from './stats'
import { photos } from './photos-manifest'

describe('derived stats', () => {
  it('counts all projects', () => {
    expect(stats.projects).toBe(6)
  })
  it('counts active projects', () => {
    expect(stats.active).toBe(4)
  })
  it('counts photo frames off the manifest', () => {
    expect(stats.frames).toBe(photos.length)
  })
  it('reports frames as a number', () => {
    expect(typeof stats.frames).toBe('number')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- stats`
Expected: FAIL, cannot resolve `./photos-manifest`.

- [ ] **Step 3: Write the accessor**

Create `src/data/photos-manifest.ts`:

```ts
import manifest from './photos.json'

export interface Photo {
  id: string
  /** Intrinsic width in pixels, after EXIF rotation. */
  w: number
  /** Intrinsic height in pixels, after EXIF rotation. */
  h: number
  /**
   * The widths actually generated for THIS photo, ascending. Never includes a
   * width larger than the source, so a srcset built from it can never point at
   * a file that was not written.
   */
  widths: number[]
  alt: string
  altIsDefault: boolean
  place: string
  year: string | null
  camera: string | null
  lens: string | null
  focalLength: string | null
  aperture: string | null
  iso: number | null
  takenAt?: string
  /** Inline base64 WebP placeholder. */
  lqip: string
}

export interface PhotoManifest {
  widths: number[]
  heroId: string | null
  photos: Photo[]
}

const data = manifest as unknown as PhotoManifest

export const widths = data.widths
export const photos = data.photos
export const heroId = data.heroId

const BASE = import.meta.env.BASE_URL

/** Path to one derivative, e.g. /Portfolio/images/photos/venice-2023/DSCF1-800.avif */
export function photoUrl(id: string, width: number, ext: 'avif' | 'webp' | 'jpg'): string {
  return `${BASE}images/photos/${id}-${width}.${ext}`
}

/**
 * A srcset across the widths actually generated for this photo. Takes the whole
 * photo, not just an id, because the ladder is per-photo: a 1440px original has
 * no 1600px derivative, and offering one would hand the browser a 404 candidate.
 */
export function photoSrcSet(photo: Photo, ext: 'avif' | 'webp' | 'jpg'): string {
  return photo.widths.map((w) => `${photoUrl(photo.id, w, ext)} ${w}w`).join(', ')
}

/** The largest derivative that actually exists for this photo. */
export function largestWidth(photo: Photo): number {
  return photo.widths[photo.widths.length - 1]
}

export function aspectOf(photo: Photo): number {
  return photo.w / photo.h
}

export function findPhoto(id: string | null): Photo | undefined {
  if (!id) return undefined
  return photos.find((p) => p.id === id)
}
```

- [ ] **Step 4: Update stats to the new shape**

Replace `src/data/stats.ts`:

```ts
import { projects } from './projects'
import { photos } from './photos-manifest'

export const stats = {
  projects: projects.length,
  active: projects.filter((p) => p.current).length,
  frames: photos.length,
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- stats`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/data/photos-manifest.ts src/data/stats.ts src/data/stats.test.ts
git commit -m "feat: typed photo manifest accessor"
```

---

## Task 6: Lightbox metadata, scroll lock and derivative sources

Done before the grid so the grid has its final `Frame` contract to render against.

**Files:**
- Modify: `src/lib/smooth-scroll.tsx`
- Modify: `src/components/sections/Lightbox.tsx`
- Modify: `src/components/sections/Lightbox.test.tsx`

- [ ] **Step 1: Expose a scroll lock from the smooth-scroll provider**

In `src/lib/smooth-scroll.tsx`, change the context interface, the default value, and add the callback. Replace lines 1 through 15 with:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface ScrollContext {
  scrollTo: (id: string) => void
  setScrollLocked: (locked: boolean) => void
}

const Ctx = createContext<ScrollContext>({
  scrollTo: () => {},
  setScrollLocked: () => {},
})

export const useSmoothScroll = () => useContext(Ctx)
```

Then, inside `SmoothScrollProvider`, add this above the existing `scrollTo`:

```tsx
  // Lenis keeps running behind a modal, so both it and native overflow are pinned.
  const setScrollLocked = useCallback((locked: boolean) => {
    if (locked) {
      lenisRef.current?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenisRef.current?.start()
      document.body.style.overflow = ''
    }
  }, [])
```

And widen the provider value:

```tsx
  return <Ctx.Provider value={{ scrollTo, setScrollLocked }}>{children}</Ctx.Provider>
```

- [ ] **Step 2: Update the Lightbox test to the new Frame type**

Replace the fixture at the top of `src/components/sections/Lightbox.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lightbox } from './Lightbox'
import type { Photo } from '../../data/photos-manifest'

const photo = (id: string, alt: string): Photo => ({
  id,
  w: 6240,
  h: 4160,
  widths: [400, 800, 1200, 1600],
  alt,
  altIsDefault: false,
  place: 'Venice',
  year: '2023',
  camera: 'Fujifilm X-T4',
  lens: 'XF16-55mmF2.8 R LM WR',
  focalLength: '23mm',
  aperture: 'f/2.8',
  iso: 200,
  lqip: 'data:image/webp;base64,AA',
})

const photos: Photo[] = [photo('a', 'A'), photo('b', 'B'), photo('c', 'C')]
```

Leave the six existing test bodies unchanged, then add two more inside the same `describe`:

```tsx
  it('shows place, year, camera and lens for the open frame', () => {
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByText(/Venice, 2023/)).toBeInTheDocument()
    expect(screen.getByText(/Fujifilm X-T4/)).toBeInTheDocument()
    expect(screen.getByText(/XF16-55mmF2\.8/)).toBeInTheDocument()
  })

  it('loads a derivative rather than an original', () => {
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    const img = screen.getByAltText('A') as HTMLImageElement
    expect(img.getAttribute('src')).toContain('-1600.jpg')
  })

  it('falls back to the largest width a narrow photo actually has', () => {
    const narrow: Photo = { ...photo('n', 'N'), w: 1440, h: 960, widths: [400, 800, 1200] }
    render(<Lightbox photos={[narrow]} index={0} onClose={() => {}} onChange={() => {}} />)
    const img = screen.getByAltText('N') as HTMLImageElement
    expect(img.getAttribute('src')).toContain('-1200.jpg')
    expect(img.getAttribute('src')).not.toContain('-1600')
  })
```

- [ ] **Step 3: Run the test to verify the two new cases fail**

Run: `npm test -- Lightbox`
Expected: FAIL on the two new tests. The metadata text and the `-1600.jpg` source do not exist yet.

- [ ] **Step 4: Update the Lightbox**

Replace `src/components/sections/Lightbox.tsx` entirely:

```tsx
import { useEffect, useRef } from 'react'
import { largestWidth, photoUrl, type Photo } from '../../data/photos-manifest'
import { useSmoothScroll } from '../../lib/smooth-scroll'

export type Frame = Photo

function metaLine(photo: Photo): string {
  const where = [photo.place, photo.year].filter(Boolean).join(', ')
  const gear = [photo.camera, photo.lens].filter(Boolean).join(' · ')
  return [where, gear].filter(Boolean).join('  ')
}

export function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Photo[]
  index: number | null
  onClose: () => void
  onChange: (next: number) => void
}) {
  const wrap = (i: number) => (i + photos.length) % photos.length
  const dialogRef = useRef<HTMLDivElement>(null)
  const { setScrollLocked } = useSmoothScroll()

  useEffect(() => {
    if (index === null) return
    setScrollLocked(true)
    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onChange(wrap(index - 1))
      if (e.key === 'ArrowRight') onChange(wrap(index + 1))
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button'))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey) {
          if (active === first || !dialogRef.current.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last || !dialogRef.current.contains(active)) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      setScrollLocked(false)
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
      <picture>
        <source srcSet={photoUrl(frame.id, largestWidth(frame), 'avif')} type="image/avif" />
        <source srcSet={photoUrl(frame.id, largestWidth(frame), 'webp')} type="image/webp" />
        <img
          src={photoUrl(frame.id, largestWidth(frame), 'jpg')}
          alt={frame.alt}
          className="max-w-[90vw] max-h-[84vh] object-contain rounded-[10px]"
        />
      </picture>
      <button
        aria-label="Next photo"
        onClick={() => onChange(wrap(index + 1))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ts text-[46px] p-4 hover:text-accent select-none"
      >
        ›
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 px-4 text-center">
        <span className="text-ts text-[13px] font-head tracking-wide">
          Frame <b className="text-accent">{String(index + 1).padStart(2, '0')}</b> /{' '}
          {String(photos.length).padStart(2, '0')}
        </span>
        <span className="text-tm text-[12px] font-head tracking-wide">{metaLine(frame)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- Lightbox`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/smooth-scroll.tsx src/components/sections/Lightbox.tsx src/components/sections/Lightbox.test.tsx
git commit -m "feat: lightbox metadata, scroll lock and responsive sources"
```

---

## Task 7: Justified photo grid

**Files:**
- Modify: `src/components/sections/Photography.tsx`
- Test: `src/components/sections/Photography.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/sections/Photography.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Photography } from './Photography'
import type { Photo } from '../../data/photos-manifest'

const photo = (id: string, alt: string, w: number, h: number): Photo => ({
  id,
  w,
  h,
  widths: [400, 800, 1200].filter((x) => x <= w),
  alt,
  altIsDefault: false,
  place: 'Venice',
  year: '2023',
  camera: 'Fujifilm X-T4',
  lens: 'XF16-55mmF2.8 R LM WR',
  focalLength: '23mm',
  aperture: 'f/2.8',
  iso: 200,
  lqip: 'data:image/webp;base64,AA',
})

const fixture: Photo[] = [
  photo('venice-2023/one', 'Canal at dusk', 1500, 1000),
  photo('venice-2023/two', 'Narrow alley', 1000, 1500),
  photo('venice-2023/three', 'Rialto bridge', 1500, 1000),
]

describe('Photography grid', () => {
  it('renders every photo as a focusable button', () => {
    render(<Photography items={fixture} />)
    const tiles = screen.getAllByRole('button')
    expect(tiles).toHaveLength(fixture.length)
  })

  it('gives each tile real alt text, never a placeholder', () => {
    render(<Photography items={fixture} />)
    expect(screen.getByAltText('Canal at dusk')).toBeInTheDocument()
    expect(screen.getByAltText('Narrow alley')).toBeInTheDocument()
    expect(screen.queryByAltText(/^Photo \d+$/)).toBeNull()
  })

  it('sets explicit intrinsic dimensions on every image', () => {
    render(<Photography items={fixture} />)
    const img = screen.getByAltText('Canal at dusk') as HTMLImageElement
    expect(img.getAttribute('width')).toBe('1500')
    expect(img.getAttribute('height')).toBe('1000')
  })

  it('opens the lightbox from the keyboard', async () => {
    const user = userEvent.setup()
    render(<Photography items={fixture} />)
    const tiles = screen.getAllByRole('button')
    tiles[1].focus()
    expect(document.activeElement).toBe(tiles[1])
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Photo 2 of 3')
  })

  it('renders no tiles when there are no photos', () => {
    render(<Photography items={[]} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
```

Note the `items` prop. The component defaults it to the manifest, so `App.tsx` needs no
change, but tests can inject a fixture. Mocking the manifest with `vi.spyOn` would not work:
`photos` is a plain const export, and ES module namespace objects are not configurable.

The `vi` import is unused once the spy is gone. Drop it from the import line:

```tsx
import { describe, it, expect } from 'vitest'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Photography`
Expected: FAIL. The current component renders `figure` elements, so `getAllByRole('button')` finds none.

- [ ] **Step 3: Write the implementation**

Replace `src/components/sections/Photography.tsx` entirely:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Lightbox } from './Lightbox'
import { layoutRows } from '../../lib/justified-layout'
import { aspectOf, photoSrcSet, photoUrl, photos, type Photo } from '../../data/photos-manifest'

const GUTTER = 10

/** Shorter rows on small screens so each frame stays legible. */
function targetHeightFor(width: number): number {
  if (width < 640) return 180
  if (width < 1024) return 240
  return 300
}

/** `items` defaults to the manifest; tests inject a fixture. */
export function Photography({ items = photos }: { items?: Photo[] } = {}) {
  const [index, setIndex] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(el)
    setContainerWidth(el.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  const rows = useMemo(() => {
    if (containerWidth <= 0) return []
    return layoutRows(
      items.map(aspectOf),
      containerWidth,
      targetHeightFor(containerWidth),
      GUTTER,
    )
  }, [containerWidth, items])

  // Before the first measurement there is no layout, but the photos still need
  // to reach the DOM so the grid is testable and works without ResizeObserver.
  const fallback = containerWidth <= 0 && items.length > 0

  return (
    <section id="photography" className="py-40">
      <div className="max-w-[1180px] mx-auto px-8">
        <Reveal>
          <SectionHeading num="03" title="Photography" />
        </Reveal>
      </div>

      <div ref={containerRef} className="max-w-[1600px] mx-auto px-4">
        {fallback
          ? items.map((photo, i) => (
              <Tile
                key={photo.id}
                photo={photo}
                photoIndex={i}
                width={photo.w}
                height={photo.h}
                onOpen={setIndex}
              />
            ))
          : rows.map((row, r) => (
              <div
                key={r}
                className="flex"
                style={{ gap: `${GUTTER}px`, marginBottom: `${GUTTER}px` }}
              >
                {row.tiles.map((tile) => (
                  <Tile
                    key={items[tile.index].id}
                    photo={items[tile.index]}
                    photoIndex={tile.index}
                    width={tile.width}
                    height={tile.height}
                    eager={r === 0}
                    onOpen={setIndex}
                  />
                ))}
              </div>
            ))}
      </div>

      <Lightbox photos={items} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
    </section>
  )
}

function Tile({
  photo,
  photoIndex,
  width,
  height,
  eager = false,
  onOpen,
}: {
  photo: Photo
  photoIndex: number
  width: number
  height: number
  eager?: boolean
  onOpen: (i: number) => void
}) {
  return (
    <button
      onClick={() => onOpen(photoIndex)}
      aria-label={`Open photo: ${photo.alt}`}
      style={{ width: `${width}px`, height: `${height}px`, backgroundImage: `url(${photo.lqip})` }}
      className="group relative shrink-0 overflow-hidden rounded-[6px] bg-cover bg-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <picture>
        <source srcSet={photoSrcSet(photo, 'avif')} sizes={`${Math.round(width)}px`} type="image/avif" />
        <source srcSet={photoSrcSet(photo, 'webp')} sizes={`${Math.round(width)}px`} type="image/webp" />
        <img
          src={photoUrl(photo.id, photo.widths[0], 'jpg')}
          srcSet={photoSrcSet(photo, 'jpg')}
          sizes={`${Math.round(width)}px`}
          alt={photo.alt}
          width={photo.w}
          height={photo.h}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </picture>
    </button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Photography`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Photography.tsx src/components/sections/Photography.test.tsx
git commit -m "feat: justified photo grid with keyboard-accessible tiles"
```

---

## Task 8: Hero consumes the manifest hero frame

**Files:**
- Modify: `src/components/sections/Hero.tsx:7`, `src/components/sections/Hero.tsx:13-28`

- [ ] **Step 1: Replace the hardcoded background**

In `src/components/sections/Hero.tsx`, replace the import block at line 7:

```tsx
import { findPhoto, heroId, largestWidth, photoSrcSet, photoUrl } from '../../data/photos-manifest'
```

Replace the section opening and the background block (lines 13 to 28) with:

```tsx
  const hero = findPhoto(heroId)

  return (
    <section id="hero" className="min-h-[100dvh] flex flex-col justify-center relative overflow-hidden">
      {/* full-bleed darkened photo background; falls back to gradient alone */}
      <div className="absolute inset-0 z-0">
        {hero && (
          <picture>
            <source srcSet={photoSrcSet(hero, 'avif')} sizes="100vw" type="image/avif" />
            <source srcSet={photoSrcSet(hero, 'webp')} sizes="100vw" type="image/webp" />
            <img
              src={photoUrl(hero.id, largestWidth(hero), 'jpg')}
              srcSet={photoSrcSet(hero, 'jpg')}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              className="w-full h-full object-cover opacity-30 contrast-105 scale-105"
            />
          </picture>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(8,8,10,.55) 0%,rgba(8,8,10,.55) 45%,var(--color-bg) 100%),radial-gradient(70% 60% at 30% 40%,transparent,rgba(8,8,10,.35))',
          }}
        />
      </div>
```

Note: `min-h-screen` becomes `min-h-[100dvh]`, which also fixes the iOS Safari address-bar jump flagged in the audit.

Delete the now-unused `const BASE = import.meta.env.BASE_URL` line if nothing else in the file references it. The profile image below still uses `BASE`, so keep it.

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: PASS, all tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat: hero reads its background from the photo manifest"
```

---

## Task 9: Remove the old photo set and verify

**Files:**
- Delete: `public/images/photos/*`

- [ ] **Step 1: Delete the old originals**

```bash
git rm -r --quiet public/images/photos
```

These are the 30 unoptimized originals. The directory is regenerated by `npm run photos`.

Note: this does not shrink the repository. Those blobs remain in git history, and removing them requires a `git filter-repo` rewrite that is explicitly out of scope for this plan.

- [ ] **Step 2: Regenerate against whatever is in photos/**

Run: `npm run photos`
Expected: exits 0. With an empty `photos/` it writes an empty manifest and warns about the missing hero.

- [ ] **Step 3: Typecheck and build**

Run: `npm run build`
Expected: `tsc -b` passes with no errors, vite build succeeds.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: exactly 2 errors, both pre-existing and both out of scope for this plan:

```
src/hooks/usePrefersReducedMotion.ts:8   react-hooks/set-state-in-effect
src/lib/smooth-scroll.tsx:11             react-refresh/only-export-components
```

Do NOT fix these. They predate this work and are unrelated to the photo pipeline.
`scripts/*.mjs` is not linted at all: the flat config scopes its only block to
`**/*.{ts,tsx}`. That is a pre-existing gap, also out of scope.

A THIRD error, or an error in any file this plan touches, is a real regression and must
be fixed before the task is complete.

- [ ] **Step 5: Full test suite**

Run: `npm test`
Expected: PASS. Expected total is 50 tests: 25 original (minus 1 replaced stats assertion, plus 1 added) plus 8 layout, 13 script-lib, 2 lightbox, 5 photography.

- [ ] **Step 6: Manual verification in the browser**

Run: `npm run dev`

Check, with at least three photos in `photos/<folder>/`:
1. Rows land flush against both edges of the grid container.
2. Resizing the window reflows rows without distorting any photo.
3. Tab reaches every tile, a visible focus ring appears, and Enter opens the lightbox.
4. The page behind the lightbox does not scroll.
5. The lightbox shows place, year, camera and lens.
6. DevTools Network shows AVIF or WebP being served, at a width close to the tile's rendered size rather than the original.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove unoptimized photo originals"
```

---

## Self-Review Notes

Checked against the spec:

- Source layout, gitignored originals, per-folder `captions.json`, root `hero.json` - Task 4.
- Script steps 1 through 5, idempotency, empty-input safety, conventional derivative paths - Tasks 3 and 4.
- Manifest shape including `heroId` - Tasks 3 and 5.
- Alt defaulting, `altIsDefault`, the count of remaining defaults printed per run - Tasks 3 and 4.
- Hero as a named role with gradient fallback - Tasks 4 and 8.
- `layoutRows` signature and last-row rule - Task 1.
- `ResizeObserver`, `useMemo`, breakpoint row heights - Tasks 2 and 7.
- Button tiles, picture/srcset/sizes, explicit dimensions, LQIP, lazy except first row - Task 7.
- `max-w-[1600px]` grid against the 1180px heading - Task 7.
- Lightbox metadata, Lenis lock, 1600px derivative - Task 6.
- All three test files from the spec - Tasks 1, 3, 7, plus the Lightbox additions in Task 6.

Two spec gaps found and covered here, both knock-on effects the spec did not name:

1. `src/data/stats.ts` reads `photos.json` as a bare array and breaks when it becomes an object. Its test also hardcodes `frames === 30`, which is wrong under recuration. Task 5.
2. `Lightbox`'s exported `Frame` type changes shape, breaking `Lightbox.test.tsx`. Task 6.
