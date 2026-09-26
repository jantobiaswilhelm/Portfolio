import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { largestWidth, photoUrl, type Photo } from '../../data/photos-manifest'
import { useSmoothScroll } from '../../lib/smooth-scroll'
import { EASE_MOVE, EASE_OUT, RM, animate, pad2, settled } from '../../motion/env'

export type Frame = Photo

function metaLine(photo: Photo): string {
  const where = [photo.place, photo.year].filter(Boolean).join(', ')
  const gear = [photo.camera, photo.lens].filter(Boolean).join(' · ')
  return [where, gear].filter(Boolean).join('  ·  ')
}

function exifLine(photo: Photo): string {
  return [photo.focalLength, photo.aperture, photo.iso && `ISO ${photo.iso}`].filter(Boolean).join(' · ')
}

interface Rect { left: number; top: number; width: number; height: number }

/** Where the photo rests: as large as fits, centred, a little above middle for the caption. */
function fitRect(ar: number): Rect {
  const vw = window.innerWidth, vh = window.innerHeight
  const maxW = vw * (vw < 700 ? 0.94 : 0.84), maxH = vh * 0.76
  let w = maxW, h = w / ar
  if (h > maxH) { h = maxH; w = h * ar }
  return { left: (vw - w) / 2, top: (vh - h) / 2 - 12, width: w, height: h }
}

const flipFrom = (from: Rect, to: Rect) =>
  `translate3d(${from.left - to.left}px,${from.top - to.top}px,0) scale(${from.width / to.width},${from.height / to.height})`

const imgOf = (el: HTMLElement) => el.querySelector('img') ?? el

/**
 * Fullscreen photo viewer. Opens as a shared-element zoom out of the tile you
 * clicked (`originFor`), steps with a short directional swap, and closes by
 * flying back to whichever tile you ended on. Without an origin, without WAAPI
 * or under reduced motion it simply appears and disappears.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onChange,
  originFor,
}: {
  photos: Photo[]
  index: number | null
  onClose: () => void
  onChange: (next: number) => void
  /** The tile this frame opened from / closes back to (for the zoom). */
  originFor?: (i: number) => HTMLElement | null
}) {
  const wrap = (i: number) => (i + photos.length) % photos.length
  const dialogRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const shown = useRef<number | null>(null) // index currently on screen, for step direction
  const hidden = useRef<HTMLElement | null>(null) // tile image hidden while it "is" the lightbox
  const { setScrollLocked } = useSmoothScroll()
  const open = index !== null

  const hideOrigin = useCallback((i: number | null) => {
    if (hidden.current) hidden.current.style.visibility = ''
    hidden.current = null
    const el = i === null ? null : originFor?.(i)
    if (el) { hidden.current = imgOf(el); hidden.current.style.visibility = 'hidden' }
  }, [originFor])

  // Open / close lifecycle: scroll lock, focus, and restoring the tile.
  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    closing.current = false
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => {
      setScrollLocked(false)
      hideOrigin(null)
      shown.current = null
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [open, setScrollLocked, hideOrigin])

  // Place the image before paint; zoom in on open, directional swap on step.
  useLayoutEffect(() => {
    if (index === null) return
    const img = imgRef.current, dialog = dialogRef.current
    if (!img || !dialog) return
    const frame = photos[index]
    const to = fitRect(frame.w / frame.h)
    Object.assign(img.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` })
    const origin = originFor?.(index) ?? null
    // show the already-loaded tile image until the big one arrives, so nothing flashes blank
    const tileSrc = origin ? (imgOf(origin) as HTMLImageElement).currentSrc : ''
    img.style.backgroundImage = tileSrc ? `url("${tileSrc}")` : `url("${frame.lqip}")`
    const prev = shown.current
    shown.current = index
    hideOrigin(index)
    img.getAnimations?.().forEach((a) => a.cancel())
    if (prev === null) {
      // opening
      if (origin && !RM && typeof img.animate === 'function') {
        const r = origin.getBoundingClientRect()
        animate(img, [{ transform: flipFrom(r, to) }, { transform: 'none' }], { duration: 560, easing: EASE_MOVE })
        animate(bgRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease', fill: 'forwards' })
        const t = window.setTimeout(() => dialog.classList.add('ui-in'), 380)
        return () => clearTimeout(t)
      }
      if (bgRef.current) bgRef.current.style.opacity = '1'
      dialog.classList.add('ui-in')
    } else if (prev !== index && !RM) {
      // a step within the first 380ms cancelled the controls' fade-in timer above
      dialog.classList.add('ui-in')
      // stepping: short on purpose — arrows get pressed in bursts
      const dir = wrap(prev + 1) === index ? 1 : -1
      animate(img, [{ opacity: 0, transform: `translate3d(${dir * 36}px,0,0)` }, { opacity: 1, transform: 'none' }], { duration: 240, easing: EASE_OUT })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, photos])

  const requestClose = useCallback(() => {
    if (index === null || closing.current) return
    const img = imgRef.current
    if (RM || !img || typeof img.animate !== 'function') { onClose(); return }
    closing.current = true
    dialogRef.current?.classList.remove('ui-in')
    const to = img.getBoundingClientRect()
    const target = originFor?.(index)?.getBoundingClientRect()
    const onScreen = !!target && target.bottom > 0 && target.top < window.innerHeight && target.width > 0
    img.getAnimations().forEach((a) => a.cancel())
    const anim = onScreen
      ? animate(img, [{ transform: 'none' }, { transform: flipFrom(target!, to) }], { duration: 480, easing: EASE_MOVE, fill: 'forwards' })
      : animate(img, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 220, easing: EASE_OUT, fill: 'forwards' })
    animate(bgRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: 'ease', fill: 'forwards' })
    settled(anim, 480).then(onClose)
  }, [index, onClose, originFor])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
      if (e.key === 'ArrowLeft') onChange(wrap(index - 1))
      if (e.key === 'ArrowRight') onChange(wrap(index + 1))
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button'))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey) {
          if (active === first || !dialogRef.current.contains(active)) { e.preventDefault(); last.focus() }
        } else if (active === last || !dialogRef.current.contains(active)) {
          e.preventDefault(); first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, requestClose, onChange])

  if (index === null) return null
  const frame = photos[index]
  const big = largestWidth(frame)
  const exif = exifLine(frame)

  return (
    <div
      ref={dialogRef}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      tabIndex={-1}
    >
      <div className="lb-bg" ref={bgRef} onClick={requestClose} />
      <picture>
        <source srcSet={photoUrl(frame.id, big, 'avif')} type="image/avif" />
        <source srcSet={photoUrl(frame.id, big, 'webp')} type="image/webp" />
        <img ref={imgRef} className="lb-img" src={photoUrl(frame.id, big, 'jpg')} alt={frame.alt} />
      </picture>
      <div className="lb-ui">
        <button ref={closeRef} className="lb-close" aria-label="Close" onClick={requestClose}>Close ✕</button>
        <button className="lb-nav lb-prev" aria-label="Previous photo" onClick={() => onChange(wrap(index - 1))}>‹</button>
        <button className="lb-nav lb-next" aria-label="Next photo" onClick={() => onChange(wrap(index + 1))}>›</button>
        <div className="lb-cap">
          <span>Frame <b className="lb-n">{pad2(index + 1)}</b> / {pad2(photos.length)}</span>
          <span className="meta">{metaLine(frame)}</span>
          {exif && <span className="meta">{exif}</span>}
        </div>
      </div>
    </div>
  )
}
