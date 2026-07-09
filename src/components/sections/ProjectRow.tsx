import { motion } from 'framer-motion'
import type { Project } from '../../data/projects'

const BASE = import.meta.env.BASE_URL

function links(p: Project): { label: string; href: string; primary: boolean }[] {
  const out: { label: string; href: string; primary: boolean }[] = []
  if (p.live) out.push({ label: 'Live', href: p.live, primary: true })
  if (p.github) out.push({ label: 'GitHub', href: p.github, primary: false })
  if (p.publication) out.push({ label: 'Publication', href: p.publication, primary: false })
  return out
}

export function ProjectRow({
  project,
  index,
  open,
  onToggle,
}: {
  project: Project
  index: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-t border-border last:border-b">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full grid grid-cols-[36px_1fr_auto] md:grid-cols-[60px_1fr_auto_24px] gap-7 items-center py-8 text-left transition-all ${
          open ? 'pl-3.5' : 'hover:pl-3.5'
        }`}
      >
        <span className="font-head text-tm text-sm">0{index + 1}</span>
        <span>
          <span className={`block font-head font-bold text-[clamp(22px,3vw,30px)] transition-colors ${open ? 'text-accent' : ''}`}>
            {project.title}
          </span>
          <span className="block text-ts text-sm mt-1">{project.tagline}</span>
        </span>
        <span className="hidden md:flex flex-col items-end gap-2">
          <span className="font-head text-accent text-[13px]">{project.year}</span>
          <span className="flex gap-1.5 flex-wrap justify-end max-w-[280px]">
            {project.stack.slice(0, 5).map((s) => (
              <span key={s} className="text-[11px] text-ts border border-border px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </span>
        </span>
        <span className={`hidden md:block text-tm text-xl transition-transform ${open ? 'rotate-90 text-accent' : ''}`}>›</span>
      </button>

      <motion.div initial={false} animate={{ height: open ? 'auto' : 0 }} style={{ overflow: 'hidden' }}>
        <div className="pb-10 md:pl-[88px] max-w-[820px]">
          <p className="text-ts mb-5">{project.description}</p>
          <h4 className="font-head text-xs tracking-[0.1em] uppercase text-tm mb-3">Highlights</h4>
          <ul className="flex flex-col gap-2 mb-6">
            {project.highlights.map((h) => (
              <li key={h} className="text-tp text-sm pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-accent">
                {h}
              </li>
            ))}
          </ul>
          {project.previews.length > 0 && (
            <div className="flex gap-3 mb-6 flex-wrap">
              {project.previews.map((pv) => (
                <img
                  key={pv.src}
                  src={`${BASE}${pv.src}`}
                  alt={pv.caption}
                  loading="lazy"
                  className="w-[180px] h-[110px] object-cover rounded-[10px] border border-border"
                />
              ))}
            </div>
          )}
          {links(project).length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {links(project).map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-head text-[13px] transition-colors ${
                    l.primary ? 'bg-accent text-[#111] hover:bg-accent-hover' : 'border border-border text-ts hover:border-accent hover:text-accent'
                  }`}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
