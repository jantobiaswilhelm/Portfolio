import { useEffect, useState } from 'react'
import { SECTIONS, SECTION_IDS } from '../../lib/sections'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useSmoothScroll } from '../../lib/smooth-scroll'

export function Nav() {
  const active = useActiveSection(SECTION_IDS)
  const { scrollTo } = useSmoothScroll()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? 'backdrop-blur-md bg-bg/70 border-b border-border' : ''
      }`}
    >
      <div className={`max-w-[1180px] mx-auto px-8 flex items-center justify-between transition-all ${scrolled ? 'py-3.5' : 'py-5'}`}>
        <button onClick={() => scrollTo('hero')} className="font-head font-bold text-[17px] tracking-wide">
          JAN WILHELM<span className="text-accent">.</span>
        </button>
        <div className="hidden md:flex gap-8 text-[13px]">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`transition-colors ${active === s.id ? 'text-tp' : 'text-ts hover:text-tp'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
