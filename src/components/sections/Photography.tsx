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
