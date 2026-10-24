import { largestWidth, photoUrl, type Photo } from '../data/photos-manifest'

/** One image in the lightbox: what to load, its shape, and the caption lines under it. */
export interface Slide {
  src: string
  sources?: { srcSet: string; type: string }[]
  w: number
  h: number
  alt: string
  /** Shown while the full image loads when there's no tile to borrow from. */
  placeholder?: string
  lines: string[]
}

function metaLine(photo: Photo): string {
  const where = [photo.place, photo.year].filter(Boolean).join(', ')
  const gear = [photo.camera, photo.lens].filter(Boolean).join(' · ')
  return [where, gear].filter(Boolean).join('  ·  ')
}

function exifLine(photo: Photo): string {
  return [photo.focalLength, photo.aperture, photo.iso && `ISO ${photo.iso}`].filter(Boolean).join(' · ')
}

/** A photo as a slide: its largest derivative, place and gear, then the exposure. */
export function photoSlide(photo: Photo): Slide {
  const big = largestWidth(photo)
  return {
    src: photoUrl(photo.id, big, 'jpg'),
    sources: [
      { srcSet: photoUrl(photo.id, big, 'avif'), type: 'image/avif' },
      { srcSet: photoUrl(photo.id, big, 'webp'), type: 'image/webp' },
    ],
    w: photo.w,
    h: photo.h,
    alt: photo.alt,
    placeholder: photo.lqip,
    lines: [metaLine(photo), exifLine(photo)].filter(Boolean),
  }
}
