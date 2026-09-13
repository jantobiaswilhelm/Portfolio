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
