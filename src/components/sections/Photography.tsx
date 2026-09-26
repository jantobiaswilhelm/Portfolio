import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Lightbox } from './Lightbox'
import { COLUMN_SPEEDS, columnCount, distribute } from '../../lib/columns'
import { aspectOf, photoSrcSet, photoUrl, photos, type Photo } from '../../data/photos-manifest'
import { RM, clamp } from '../../motion/env'
import { S, useTick } from '../../motion/ticker'
import { reveal } from '../../motion/reveal'
import { Split } from '../../motion/Split'
import '../../styles/photography.css'

/** Matches the column layout in lib/columns (2 / 3 / 4 / 5 columns). */
const SIZES = '(max-width: 600px) 50vw, (max-width: 1000px) 33vw, (max-width: 1400px) 25vw, 300px'

/** What the viewfinder cursor reads out over a frame. */
function exifOf(p: Photo): string {
  return [p.focalLength, p.aperture, p.iso && `ISO ${p.iso}`].filter(Boolean).join(' · ') || p.place.toUpperCase()
}

/**
 * The photo wall: frames in counter-sliding columns (each drifts at its own
 * parallax speed and leans with scroll velocity), each one developing out of
 * paper-white as it arrives, under a faint darkroom safelight. Click opens the
 * lightbox as a zoom out of the tile. `items` defaults to the manifest; tests inject a fixture.
 */
export function Photography({ items = photos }: { items?: Photo[] } = {}) {
  const [index, setIndex] = useState<number | null>(null)
  const [cols, setCols] = useState(() => columnCount(typeof window === 'undefined' ? 1024 : window.innerWidth))
  const sectionRef = useRef<HTMLElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const safelightRef = useRef<HTMLDivElement>(null)
  const colRefs = useRef<(HTMLDivElement | null)[]>([])
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
  const near = useRef(false)

  useEffect(() => {
    const onResize = () => setCols(columnCount(window.innerWidth))
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])

  const columns = useMemo(() => distribute(items, cols, aspectOf), [items, cols])

  // Develop each frame from paper as it arrives; arrivals close together share one stagger.
  useEffect(() => {
    const tiles = tileRefs.current.filter((t): t is HTMLButtonElement => !!t)
    const timers: number[] = []
    let batch = 0
    let batchTimer = 0
    const develop = (t: HTMLElement) => {
      const d = batch++ * 75
      t.style.setProperty('--d', `${d}ms`)
      clearTimeout(batchTimer)
      batchTimer = window.setTimeout(() => (batch = 0), 140)
      t.classList.add('dev')
      // once developed, hover should answer without the stagger delay
      timers.push(window.setTimeout(() => { t.style.setProperty('--d', '0ms'); t.classList.add('done') }, 2400 + d))
    }
    const whenLoaded = (t: HTMLElement) => {
      const img = t.querySelector('img')
      if (!img || (img.complete && img.naturalWidth)) develop(t)
      else img.addEventListener('load', () => develop(t), { once: true })
    }
    if (typeof IntersectionObserver === 'undefined') { tiles.forEach(whenLoaded); return }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return
      io.unobserve(e.target)
      whenLoaded(e.target as HTMLElement)
    }), { rootMargin: '0px 0px -6% 0px' })
    tiles.forEach((t) => { if (!t.classList.contains('dev')) io.observe(t) })
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
      clearTimeout(batchTimer)
    }
  }, [columns])

  // Only animate the columns while the section is near the viewport.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => { near.current = e.isIntersecting }, { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useTick(() => {
    if (!near.current) return
    const clip = clipRef.current, section = sectionRef.current
    if (!clip || !section) return
    const r = clip.getBoundingClientRect()
    const p = clamp((S.vh / 2 - (r.top + r.height / 2)) / (r.height / 2 + S.vh / 2), -1, 1)
    const skew = clamp(S.sv * 0.08, -4, 4)
    const speeds = COLUMN_SPEEDS[cols] ?? []
    colRefs.current.forEach((c, k) => {
      if (c) c.style.transform = `translate3d(0,${((speeds[k] ?? 0) * p * r.height * 0.5).toFixed(1)}px,0) skewY(${skew.toFixed(2)}deg)`
    })
    // the safelight glows while you're in the darkroom
    const sr = section.getBoundingClientRect()
    if (safelightRef.current) {
      safelightRef.current.style.opacity = (clamp((S.vh - sr.top) / (S.vh * 0.8)) * (1 - clamp((S.vh * 0.6 - sr.bottom) / (S.vh * 0.6)))).toFixed(3)
    }
  }, { enabled: !RM })

  const originFor = useCallback((i: number) => tileRefs.current[i] ?? null, [])

  return (
    <section id="photography" className="pad photos" ref={sectionRef}>
      <div className="safelight" ref={safelightRef} aria-hidden="true" />
      <div className="wrap">
        <div className="sh" data-reveal="split" ref={reveal}>
          <span className="sh-num">04</span>
          <h2 aria-label="Photography"><Split text="Photography" /></h2>
          <i className="sh-line" />
        </div>
        <p className="sh-sub" data-reveal ref={reveal}>
          {items.length} frames · Fujifilm X-S20 · hover to meter, click to enlarge
        </p>
      </div>

      <div className="cols-clip" ref={clipRef}>
        <div className="cols" style={{ '--n': cols } as CSSProperties}>
          {columns.map((column, k) => (
            <div className="col" key={`${cols}-${k}`} ref={(el) => { colRefs.current[k] = el }}>
              {column.map(({ item: photo, index: i }) => (
                <Tile
                  key={photo.id}
                  photo={photo}
                  onOpen={() => setIndex(i)}
                  tileRef={(el) => { tileRefs.current[i] = el }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <Lightbox photos={items} index={index} onClose={() => setIndex(null)} onChange={setIndex} originFor={originFor} />
    </section>
  )
}

function Tile({ photo, onOpen, tileRef }: { photo: Photo; onOpen: () => void; tileRef: (el: HTMLButtonElement | null) => void }) {
  return (
    <button
      ref={tileRef}
      className="tile"
      data-cursor="photo"
      data-exif={exifOf(photo)}
      onClick={onOpen}
      aria-label={`Open photo: ${photo.alt}`}
      style={{
        aspectRatio: `${photo.w} / ${photo.h}`,
        // photo paper with the faintest latent image in it, until the frame develops
        backgroundImage: `linear-gradient(rgba(235,230,220,.82),rgba(235,230,220,.82)),url(${photo.lqip})`,
      }}
    >
      <picture>
        <source srcSet={photoSrcSet(photo, 'avif')} sizes={SIZES} type="image/avif" />
        <source srcSet={photoSrcSet(photo, 'webp')} sizes={SIZES} type="image/webp" />
        <img
          src={photoUrl(photo.id, photo.widths[0], 'jpg')}
          srcSet={photoSrcSet(photo, 'jpg')}
          sizes={SIZES}
          alt={photo.alt}
          width={photo.w}
          height={photo.h}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </button>
  )
}
