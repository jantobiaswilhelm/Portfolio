import { useEffect, useRef, type CSSProperties } from 'react'
import { reveal } from '../../motion/reveal'
import { addTick, S } from '../../motion/ticker'
import { FINE, RM, EASE_OUT, animate, clamp } from '../../motion/env'
import { shutter } from '../../motion/sound'
import { socials } from '../../data/socials'

const LINES = [["Let's", 'build'], ['something.']]
const email = socials.find((s) => s.href.startsWith('mailto:'))
const others = socials.filter((s) => !s.href.startsWith('mailto:'))

interface Letter { el: HTMLSpanElement; ox: number; oy: number; x: number; y: number; vx: number; vy: number; moving: boolean }
interface Magnet { el: HTMLAnchorElement; lab: HTMLSpanElement; x: number; y: number }

/** One frame of the contact physics: repelled spring letters, magnetic pills. */
function step(big: HTMLElement, letters: Letter[], magnets: Magnet[]) {
  // letters: spring back to rest, pushed away within 140px of the pointer
  const b = big.getBoundingClientRect()
  const R = 140
  for (const l of letters) {
    const dx = b.left + l.ox + l.x - S.px, dy = b.top + l.oy + l.y - S.py
    const d = Math.hypot(dx, dy)
    if (S.pIn && d < R && d > 0.01) {
      const f = Math.pow(1 - d / R, 2) * 9
      l.vx += (dx / d) * f
      l.vy += (dy / d) * f
    }
    l.vx = (l.vx - l.x * 0.08) * 0.82
    l.vy = (l.vy - l.y * 0.08) * 0.82
    l.x += l.vx
    l.y += l.vy
    if (Math.abs(l.x) + Math.abs(l.y) + Math.abs(l.vx) + Math.abs(l.vy) > 0.02) {
      l.el.style.transform = `translate3d(${l.x.toFixed(2)}px,${l.y.toFixed(2)}px,0) rotate(${clamp(l.vx * 1.6, -25, 25).toFixed(2)}deg)`
      l.moving = true
    } else if (l.moving) {
      l.el.style.transform = ''
      l.moving = false
      l.x = l.y = l.vx = l.vy = 0
    }
  }
  if (!FINE) return
  // magnetic pills: pull toward the pointer when it's near, lerped back when it leaves
  for (const m of magnets) {
    const r = m.el.getBoundingClientRect()
    const dx = S.px - (r.left + r.width / 2 - m.x), dy = S.py - (r.top + r.height / 2 - m.y)
    const near = S.pIn && Math.abs(dx) < r.width / 2 + 30 && Math.abs(dy) < r.height / 2 + 30
    m.x += ((near ? dx * 0.35 : 0) - m.x) * 0.15
    m.y += ((near ? dy * 0.45 : 0) - m.y) * 0.15
    m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,${m.y.toFixed(2)}px,0)`
    m.lab.style.transform = `translate3d(${(m.x * 0.35).toFixed(2)}px,${(m.y * 0.35).toFixed(2)}px,0)`
  }
}

/**
 * Contact: the big line's letters are little springs the pointer pushes away;
 * the email is a shutter-release button (soft shutter sound if sound is on, and
 * a white flash); the other links pull magnetically toward the pointer.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const bigRef = useRef<HTMLHeadingElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  // The physics state lives inside the effect, not in React: it's mutated every frame.
  useEffect(() => {
    if (RM) return
    const big = bigRef.current!
    const letters: Letter[] = [...big.querySelectorAll<HTMLSpanElement>('.l')].map((el) => ({ el, ox: 0, oy: 0, x: 0, y: 0, vx: 0, vy: 0, moving: false }))
    const magnets: Magnet[] = [...sectionRef.current!.querySelectorAll<HTMLAnchorElement>('.mag')].map((el) => ({ el, lab: el.querySelector('span')!, x: 0, y: 0 }))
    let visible = false
    // rest positions relative to the heading, so page layout above can change freely
    const measure = () => {
      const b = big.getBoundingClientRect()
      letters.forEach((l) => {
        const r = l.el.getBoundingClientRect()
        l.ox = r.left + r.width / 2 - l.x - b.left
        l.oy = r.top + r.height / 2 - l.y - b.top
      })
    }
    measure()
    document.fonts?.ready.then(measure)
    addEventListener('resize', measure)
    let io: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) measure() }, { rootMargin: '10% 0px' })
      io.observe(sectionRef.current!)
    }
    const off = addTick(() => { if (visible) step(big, letters, magnets) })
    return () => { off(); removeEventListener('resize', measure); io?.disconnect() }
  }, [])

  const fire = () => {
    shutter() // sound isn't motion: it plays under reduced motion too, if sound is on
    if (!RM) animate(flashRef.current, [{ opacity: 0.9 }, { opacity: 0 }], { duration: 420, easing: EASE_OUT })
  }

  return (
    <section id="contact" className="pad contact" ref={sectionRef}>
      <div className="wrap">
        <span className="num" data-reveal ref={reveal}>05</span>
        <h2 className="big" ref={bigRef} aria-label="Let's build something.">
          {LINES.map((line, li) => (
            <span key={li}>
              {li > 0 && <br />}
              {line.map((w, wi) => (
                <span key={wi}>
                  {wi > 0 && ' '}
                  <span className="wd" aria-hidden="true">
                    {[...w].map((c, ci) => <span key={ci} className={c === '.' ? 'l accent' : 'l'}>{c}</span>)}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h2>
        <p data-reveal ref={reveal}>Open to collaborations, freelance work and good conversations.</p>
        {email && (
          <a className="shutter-btn" data-reveal ref={reveal} style={{ '--d': '120ms' } as CSSProperties} href={email.href} aria-label="Email Jan" onClick={fire}>
            <span>SAY HI<small>PRESS TO SHOOT</small></span>
          </a>
        )}
        <div className="socials" data-reveal ref={reveal} style={{ '--d': '220ms' } as CSSProperties}>
          {others.map((s) => (
            <a key={s.label} className="mag" href={s.href} target="_blank" rel="noopener noreferrer">
              <span>{s.label} ↗</span>
            </a>
          ))}
        </div>
      </div>
      <div className="flash" ref={flashRef} aria-hidden="true" />
    </section>
  )
}
