import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Marquee } from '../ui/Marquee'
import { statement, bio, facts, techStack } from '../../data/about'

export function About() {
  return (
    <section id="about" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="01" title="About" />
      </Reveal>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <Reveal>
          <p className="font-head text-[clamp(22px,3vw,30px)] font-medium leading-[1.35] tracking-[-0.01em]">
            {statement.split('"')[0]}
            <span className="text-accent">"{statement.split('"')[1]}"</span>
          </p>
          <p className="text-ts mt-5">{bio}</p>
        </Reveal>
        <Reveal className="grid grid-cols-2 gap-[18px]">
          {facts.map((f) => (
            <div
              key={f.k}
              className="p-5 border border-border rounded-2xl bg-white/[0.015] transition-all hover:border-accent/35 hover:-translate-y-1"
            >
              <div className="text-[11px] text-tm tracking-[0.1em] uppercase mb-1.5">{f.k}</div>
              <div className="font-head text-[17px]">{f.v}</div>
            </div>
          ))}
        </Reveal>
      </div>
      <Reveal>
        <Marquee items={techStack} />
      </Reveal>
    </section>
  )
}
