import { useRef, type CSSProperties } from 'react'
import { Split } from '../../motion/Split'
import { reveal } from '../../motion/reveal'
import { useTick, S } from '../../motion/ticker'
import { RM, clamp, easeOutCubic, lerp } from '../../motion/env'
import { statement, bio, facts, techStack } from '../../data/about'

const BASE = import.meta.env.BASE_URL

// The statement splits into plain words and the quoted part, which lands in accent.
const [pre, quote] = statement.split('"')
const WORDS: { w: string; accent: boolean }[] = [
  ...pre.trim().split(/\s+/).map((w) => ({ w, accent: false })),
  ...`"${quote}"`.trim().split(/\s+/).map((w) => ({ w, accent: true })),
]

/** Reveal a fact card; once its entrance is done, hover answers without the stagger delay. */
function factRef(el: HTMLDivElement | null) {
  if (!el) return
  const onReveal = () => window.setTimeout(() => el.classList.add('settled'), 1400)
  el.addEventListener('reveal', onReveal, { once: true })
  const stop = reveal(el)
  return () => {
    el.removeEventListener('reveal', onReveal)
    stop?.()
  }
}

/**
 * About: the statement develops word by word as it passes through the viewport,
 * and the portrait is a print that develops (grey, overexposed, soft → true)
 * as it rises into view.
 */
export function About() {
  const statementRef = useRef<HTMLParagraphElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordOpacity = useRef<string[]>([])
  const frameRef = useRef<HTMLDivElement>(null)
  const portraitRef = useRef<HTMLImageElement>(null)

  useTick(() => {
    const st = statementRef.current
    if (st) {
      const r = st.getBoundingClientRect()
      if (r.top < S.vh && r.bottom > 0) {
        const p = clamp((S.vh * 0.85 - r.top) / (r.height + S.vh * 0.35))
        const n = WORDS.length
        wordRefs.current.forEach((w, k) => {
          if (!w) return
          const o = (0.12 + 0.88 * clamp(p * n * 1.15 - k)).toFixed(3)
          if (wordOpacity.current[k] !== o) { w.style.opacity = o; wordOpacity.current[k] = o }
        })
      }
    }
    const frame = frameRef.current, img = portraitRef.current
    if (frame && img) {
      const r = frame.getBoundingClientRect()
      if (r.top < S.vh && r.bottom > 0) {
        const pp = easeOutCubic(clamp((S.vh - r.top) / (S.vh * 0.75)))
        img.style.filter = `grayscale(${lerp(1, 0.25, pp)}) brightness(${lerp(2.3, 1, pp)}) contrast(${lerp(0.45, 1.05, pp)}) blur(${lerp(4, 0, pp)}px)`
        frame.style.transform = `rotate(${lerp(-6, -1.5, pp)}deg) translate3d(0,${lerp(40, 0, pp)}px,0)`
      }
    }
  }, { enabled: !RM })

  return (
    <section id="about" className="pad">
      <div className="wrap">
        <div className="sh" data-reveal="split" ref={reveal}>
          <span className="sh-num">01</span>
          <h2 aria-label="About"><Split text="About" /></h2>
          <i className="sh-line" />
        </div>
        <div className="about-grid">
          <div>
            <p className="statement" ref={statementRef}>
              {WORDS.map((w, k) => (
                <span key={k}>
                  <span
                    ref={(el) => { wordRefs.current[k] = el }}
                    className={w.accent ? 'sw accent' : 'sw'}
                    style={RM ? { opacity: 1 } : undefined}
                  >
                    {w.w}
                  </span>{' '}
                </span>
              ))}
            </p>
            <p className="bio" data-reveal ref={reveal}>{bio}</p>
            <div className="facts">
              {facts.map((f, i) => (
                <div key={f.k} className="fact" data-reveal ref={factRef} style={{ '--d': `${i * 70}ms` } as CSSProperties}>
                  <small>{f.k}</small>
                  <div>{f.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="portrait">
            <div className="frame" ref={frameRef}>
              <img ref={portraitRef} src={`${BASE}images/profile.png`} alt="Jan Wilhelm" loading="lazy" />
            </div>
            <div className="cap" aria-hidden="true"><span>J. WILHELM</span><span>FIG. 00</span></div>
            <i className="clip" aria-hidden="true" />
          </div>
        </div>
      </div>
      <p className="sr">Tech stack: {techStack.join(', ')}</p>
      <div className="marquee" data-reveal ref={reveal} aria-hidden="true">
        <div className="track">
          {[...techStack, ...techStack].map((t, i) => <span key={i}>{t} —</span>)}
        </div>
      </div>
    </section>
  )
}
