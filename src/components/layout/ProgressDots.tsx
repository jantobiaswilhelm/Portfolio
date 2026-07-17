import { SECTIONS, SECTION_IDS } from '../../lib/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useSmoothScroll } from '../../lib/smooth-scroll'

export function ProgressDots() {
  const active = useActiveSection(SECTION_IDS)
  const { scrollTo } = useSmoothScroll()

  return (
    <div className="hidden lg:flex fixed right-7 top-1/2 -translate-y-1/2 z-40 flex-col gap-3.5">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          aria-label={s.label}
          className={`group relative w-2.5 h-2.5 rounded-full border transition-all ${
            active === s.id ? 'bg-accent border-accent shadow-[0_0_12px_rgba(212,168,83,0.6)]' : 'border-tm'
          }`}
        >
          <span className="absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] text-ts opacity-0 group-hover:opacity-100 transition-opacity font-head">
            {s.label}
          </span>
        </button>
      ))}
    </div>
  )
}
