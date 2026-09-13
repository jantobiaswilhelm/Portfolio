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

/**
 * The widths actually generated for a source image. Never upscales past the
 * source, except for the degenerate case of an image smaller than the smallest
 * configured width, where one derivative is still produced so the manifest
 * never references a missing file.
 */
export function widthsFor(sourceWidth) {
  const usable = WIDTHS.filter((w) => w <= sourceWidth)
  return usable.length > 0 ? usable : [WIDTHS[0]]
}

/**
 * sharp's .rotate() applies EXIF orientation, which swaps width and height for
 * the quarter-turn cases (orientation 5 through 8). Returns post-rotation
 * dimensions.
 */
export function orientedSize(metadata) {
  const { width, height, orientation } = metadata
  const swapped = orientation !== undefined && orientation >= 5
  return { w: swapped ? height : width, h: swapped ? width : height }
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
