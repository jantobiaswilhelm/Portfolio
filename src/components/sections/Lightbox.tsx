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
