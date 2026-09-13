import { useState } from 'react'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Lightbox } from './Lightbox'
import { photoUrl, photos } from '../../data/photos-manifest'

// Task 7 replaces this component with a justified-rows grid that consumes the
// manifest directly. Until then it keeps its masonry markup, rendering the
// manifest's photos as-is.

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
            key={p.id}
            onClick={() => setIndex(i)}
            className="[break-inside:avoid] mb-3 overflow-hidden rounded-[14px] border border-border relative cursor-pointer group"
          >
            <img
              src={photoUrl(p.id, p.widths[0], 'jpg')}
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
