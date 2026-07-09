import { useState } from 'react'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectRow } from './ProjectRow'
import { projects } from '../../data/projects'

export function Work() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="work" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="02" title="Selected Work" />
      </Reveal>
      <div className="flex flex-col">
        {projects.map((p, i) => (
          <ProjectRow
            key={p.title}
            project={p}
            index={i}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}
