import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { trips } from '../../data/travel'

export function Travel() {
  return (
    <section id="travel" className="py-40 max-w-[1180px] mx-auto px-8">
      <Reveal>
        <SectionHeading num="04" title="Travel" />
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {trips.map((t) => (
          <Reveal
            key={t.country}
            className="p-7 border border-border rounded-[18px] bg-white/[0.015] transition-all hover:border-accent/35 hover:-translate-y-1 relative"
          >
            <span className="absolute top-[26px] right-[26px] font-head text-tm text-[13px]">{t.year}</span>
            <img
              src={`https://flagcdn.com/w80/${t.code}.png`}
              alt={t.country}
              className="w-[42px] h-[29px] rounded-[5px] object-cover mb-[18px] border border-border"
            />
            <h3 className="text-[26px] mb-1">{t.country}</h3>
            <div className="text-ts text-sm mb-[18px]">{t.city}</div>
            <div className="font-head text-xs text-accent tracking-[0.08em] uppercase">{t.type}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
