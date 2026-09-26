import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../../lib/sections'
import { useSmoothScroll } from '../../lib/smooth-scroll'
import { S, useTick } from '../../motion/ticker'
import { clamp } from '../../motion/env'
import { useSound } from '../../motion/sound'

/** Fixed nav: section links with a sliding active dot, top progress bar, sound toggle. */
export function Nav() {
  const { scrollTo } = useSmoothScroll()
  const [sound, setSound] = useSound()
  const [active, setActive] = useState('hero')
  const navRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const indRef = useRef<HTMLElement>(null)
  const lastY = useRef(-1)

  const placeIndicator = (id: string) => {
    const btn = linksRef.current?.querySelector<HTMLElement>(`[data-go="${id}"]`)
    const ind = indRef.current
    if (!ind) return
    ind.style.opacity = btn ? '1' : '0'
    if (btn) ind.style.transform = `translate3d(${btn.offsetLeft + btn.offsetWidth / 2 - 2}px,0,0)`
  }

  // link widths change with the viewport and once the web fonts land
  useEffect(() => {
    const place = () => placeIndicator(active)
    place()
    addEventListener('resize', place)
    document.fonts?.ready.then(place)
    return () => removeEventListener('resize', place)
  }, [active])

  useTick(() => {
    if (S.y === lastY.current) return
    lastY.current = S.y
    navRef.current?.classList.toggle('scrolled', S.y > 30)
    const max = Math.max(1, document.documentElement.scrollHeight - S.vh)
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${clamp(S.y / max).toFixed(4)})`
    let current = SECTIONS[0].id as string
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el && el.getBoundingClientRect().top <= S.vh * 0.4) current = s.id
    }
    if (current !== active) setActive(current)
  })

  return (
    <>
      <div className="progress" ref={progressRef} aria-hidden="true" />
      <nav className="nav" ref={navRef} aria-label="Primary">
        <div className="wrap">
          <button className="logo" onClick={() => scrollTo('hero')}>
            JAN WILHELM<span className="accent">.</span>
          </button>
          <div className="nav-r">
            <div className="links" ref={linksRef}>
              <i className="ind" ref={indRef} />
              {SECTIONS.slice(1).map((s) => (
                <button key={s.id} data-go={s.id} className={active === s.id ? 'active' : ''} onClick={() => scrollTo(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <button className="snd" aria-pressed={sound} title="Camera sounds" onClick={() => setSound(!sound)}>
              <span className="eq" aria-hidden="true"><i /><i /><i /></span>
              <span>Sound</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
