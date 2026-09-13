# Photography pipeline and justified grid

Date: 2026-09-13
Status: approved, ready for planning
Branch: redesign/single-page

## Problem

The photography section is the weakest part of the site on every axis that matters.

Measured on the live deployment at `https://jantobiaswilhelm.github.io/Portfolio/`:

- **37.23 MB of images across 40 requests** for a single page view.
- Grid photos are **1440x960 natural, displayed at 268x179**. Roughly 29x the pixels needed.
- Largest single file is **4.2 MB**. Nine files exceed 1.8 MB.
- **Zero keyboard-reachable elements inside `#photography`.** 30 `<figure>` elements carry
  `onClick` with no `tabindex`, no `role` and no key handler, so the lightbox and its
  carefully built focus trap are unreachable without a mouse.
- Alt text is `"Photo 1"` through `"Photo 30"`.
- Collapsed project accordions still download their previews (`sqlscrolls-1.png`, 2.3 MB,
  displayed at 180x110), because a `height: 0` container does not stop a queued fetch.

The cause is structural, not incidental: there is no pipeline between a file off the camera
and a file on the site. `public/images/photos/` holds full-resolution originals, and
`src/data/photos.json` is hand-edited to match.

Layout is a second, separate problem. The grid uses CSS `columns`, which fills column by
column rather than row by row, so rows never align and the gutters run ragged.

## Decisions

Settled with the user before this spec was written:

1. **Build-time script, photos stay in the repo.** No external image host, no CMS. The site
   remains a static build deployable to GitHub Pages at no cost.
2. **Justified rows** for the grid, not masonry and not a curated editorial sequence.
   Justified rows keep true aspect ratios, land flush on both edges, and absorb new photos
   without any manual rebalancing, which is what makes the upload workflow worth having.
3. **Clean grid, context in the lightbox.** No overlays or captions on grid tiles. Place,
   year, camera and lens appear when a photo is opened.
4. **Originals are gitignored.** Only generated derivatives and the manifest are committed.
   Tradeoff: a clone without the original library cannot regenerate derivatives. The
   committed derivatives still build and deploy, so this only matters when changing output
   sizes on a machine that lacks the library.
5. **The photo set is being replaced wholesale.** The user is recurating from scratch. The
   existing 30 photos and the existing `photos.json` are disposable; nothing needs migrating.

## Design

### Source layout

Originals live in a new `photos/` directory at the repo root, outside `public/`, organized
by trip or place. The directory name carries place and year:

```
photos/
  hero.json                        (optional, names the hero frame)
  venice-2023/
    DSCF8820.JPG
    captions.json                  (optional, alt-text overrides for this folder)
  china-2025/
    DSCF9671.JPG
  basel/
    DSCF9258.JPG
```

`captions.json` is per folder and always optional. `hero.json` sits at the root of `photos/`
and there is at most one.

`photos/` is gitignored. `public/images/photos/` holds only generated output and is committed.

### The script: `npm run photos`

`scripts/photos.mjs`. New devDependencies: `sharp` for image processing, `exifr` for metadata.
Neither is currently in `package.json`.

For each original, in order:

1. Read EXIF: camera body, lens, focal length, aperture, ISO, `DateTimeOriginal`.
2. Emit AVIF, WebP and JPEG derivatives at widths 400, 800, 1200, 1600.
3. Generate a small inline LQIP placeholder (base64 WebP, target under 1 KB).
4. Record intrinsic width and height.
5. Write `src/data/photos.json`.

**Idempotency.** A file is skipped when its derivatives exist and are newer than the original.
Re-running against an unchanged folder does no image work.

**Empty input.** The script must exit cleanly with an empty manifest rather than throwing,
so the repo is never in a broken state mid-recuration.

**Derivative paths are conventional**, not enumerated:
`/images/photos/<folder>/<name>-<width>.<ext>`. The component reconstructs srcsets from the id
and the width list, keeping the manifest small and readable.

### Manifest shape

```jsonc
{
  "widths": [400, 800, 1200, 1600],
  "heroId": "basel/DSCF9258",
  "photos": [
    {
      "id": "venice-2023/DSCF8820",
      "w": 6240,
      "h": 4160,
      "alt": "Venice, 2023",
      "altIsDefault": true,
      "place": "Venice",
      "year": "2023",
      "camera": "Fujifilm X-T4",
      "lens": "XF16-55mmF2.8 R LM WR",
      "lqip": "data:image/webp;base64,..."
    }
  ]
}
```

### Alt text

EXIF cannot describe a photograph. The generated default is `"<Place>, <Year>"`, which is
accurate and a large improvement on `"Photo 1"`, but is not a description. Per-file overrides
live in `photos/<folder>/captions.json`:

```json
{ "DSCF8820.JPG": "Canal boats moored at dusk near the Rialto" }
```

When an override is present the script sets `altIsDefault: false`. On each run the script
prints a count of photos still using the default, so captions can be filled in over time
without blocking the build.

### The hero background

`Hero.tsx` currently hardcodes `images/photos/DSCF9258.JPG`, which is part of the set being
replaced. The hero frame becomes a named role rather than a filename: one photo is designated
via `photos/hero.json` (`{ "id": "basel/DSCF9258" }`), and the manifest exposes it as `heroId`.
The hero then consumes the same responsive derivatives as the grid instead of a 911 KB original.

If `hero.json` is absent or names a missing photo, the script warns and the hero falls back to
a gradient-only background. The hero must never break because of a curation change.

### Justified layout

`src/lib/justified-layout.ts` exports a pure function:

```ts
layoutRows(aspects: number[], containerWidth: number, targetHeight: number, gutter: number): Row[]
```

It greedily accumulates photos into a row until the row exceeds the container width, then
scales that row to land flush on both edges. The final row is not stretched, so three leftover
photos do not balloon to full width.

Being pure and dependency-free makes it unit testable without a DOM, which is where most of
the test value sits.

`Photography.tsx` runs it in a `useMemo` keyed on container width, observed via
`ResizeObserver`. This is arithmetic over ~30 numbers, not a layout concern. Because aspect
ratios come from the manifest, every tile reserves its exact space before any image loads, so
cumulative layout shift is zero.

Target row height by breakpoint: 180px below 640px, 240px to 1024px, 300px above.

### Grid markup

Each tile is a `<button>` wrapping a `<picture>`:

- `<source type="image/avif">`, `<source type="image/webp">`, `<img>` JPEG fallback
- `srcset` across the four widths with a `sizes` attribute matching the computed tile width
- explicit `width` and `height`
- the LQIP as a background behind the image
- `loading="lazy"` on everything except the first row

Making the tile a `<button>` is what fixes the keyboard trap. All tiles become focusable and
Enter or Space opens the lightbox.

### Section width

The grid runs to `max-w-[1600px]` while the section heading stays on the existing 1180px
rhythm. Photography is the section that earns the extra width, and giving it a distinct shape
begins addressing the separate finding that all six sections currently share one layout.

### Lightbox

The existing focus trap is correct and stays as is. Three changes:

1. Render place, year, camera and lens for the open frame.
2. Stop Lenis on open and restart on close. The page currently scrolls behind the modal.
3. Load the 1600px derivative rather than the original.

## Testing

Written test first, per the project's existing vitest setup.

`src/lib/justified-layout.test.ts`
- every row except the last fills the container width within a one-pixel tolerance
- the last row is never stretched beyond its natural width
- no returned tile deviates from its input aspect ratio
- degenerate inputs: empty array, a single photo, a photo wider than the container
- gutters are excluded from the scaled width, not absorbed into it

`src/components/sections/Photography.test.tsx`
- tiles render as buttons and are keyboard focusable
- Enter on a tile opens the lightbox at that index
- each tile exposes non-placeholder alt text
- the manifest's aspect ratios reach the DOM as explicit width and height

`scripts/photos.test.mjs`
- manifest shape matches the documented schema
- alt defaults to `"<Place>, <Year>"` and `altIsDefault` flips when overridden
- an empty input directory yields an empty manifest without throwing
- a second run over unchanged input performs no image work

## Expected outcome

A full scroll-through drops from 37.23 MB to roughly 1.5 to 2.5 MB, with correctly sized
images, real alt text, keyboard access to every frame, and no layout shift.

## Out of scope

Tracked, deliberately not in this spec:

- **Curation.** The script processes whatever is in the folder. Choosing the set is the
  user's work, already underway.
- **Git history.** Deleting the current 33 MB does not shrink the repository, because those
  blobs remain in history. A `git filter-repo` rewrite is the only fix. It is optional,
  separate, and must not be run without an explicit request.
- **The rest of the audit.** Mobile navigation, the uniform 320px section gaps, the AI tells
  (section-number eyebrows, the scroll cue, marquee em-dashes, the build-stack footer), the
  missing timeline section, `--color-tm` failing WCAG AA at 3.36:1, and the project previews
  downloading while collapsed. All still outstanding, sequenced after this work. Nothing in
  this spec is invalidated by doing them later.
