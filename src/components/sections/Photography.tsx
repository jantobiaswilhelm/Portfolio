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

      <div className="max-w-[1600px] mx-auto px-4">
        <div ref={containerRef}>
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
