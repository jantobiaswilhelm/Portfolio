import { useEffect, useRef, useState } from 'react'
import { RM, clamp, easeOutCubic, pad2 } from '../../motion/env'
import { heroReady, startHero } from '../../motion/intro'
import { useSmoothScroll } from '../../lib/smooth-scroll'

/**
 * First-visit loader: counts up the frames while the hero photo decodes, then
 * a two-blade shutter opens onto the hero and starts its develop-in. Never
 * shown under reduced motion — the hero simply starts.
 */
export function Loader({ frames }: { frames: number }) {
  const [phase, setPhase] = useState<'count' | 'open' | 'gone'>(RM ? 'gone' : 'count')
  const countRef = useRef<HTMLSpanElement>(null)
  const { setScrollLocked } = useSmoothScroll()

  useEffect(() => {
    const html = document.documentElement
    if (RM) { startHero(); return }
    html.classList.add('is-loading')
    setScrollLocked(true)
    let ready = false
    let raf = 0
    const timers: number[] = []
    Promise.race([heroReady, new Promise((r) => setTimeout(r, 3500))]).then(() => { ready = true })
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = clamp((now - t0) / 1500)
      let n = Math.round(easeOutCubic(t) * frames)
      if (!ready) n = Math.min(n, frames - 3) // hold just short until the hero is decoded
      if (countRef.current) countRef.current.textContent = pad2(n)
      if (t >= 1 && ready) {
        if (countRef.current) countRef.current.textContent = pad2(frames)
        timers.push(window.setTimeout(() => {
          setPhase('open')
          timers.push(window.setTimeout(startHero, 280))
          timers.push(window.setTimeout(() => {
            setPhase('gone')
            html.classList.remove('is-loading')
            setScrollLocked(false)
          }, 1150))
        }, 260))
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      html.classList.remove('is-loading')
      setScrollLocked(false)
    }
  }, [frames, setScrollLocked])

  if (phase === 'gone') return null
  return (
    <div className={`loader${phase === 'open' ? ' open' : ''}`} aria-hidden="true">
      <div className="blade top" />
      <div className="blade bot" />
      <div className="counter">
        <div>
          <div className="count-mask"><span className="count" ref={countRef}>00</span></div>
          <span className="count-label">Loading frames</span>
        </div>
      </div>
    </div>
  )
}
