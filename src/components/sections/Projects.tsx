import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Split } from '../../motion/Split'
import { reveal } from '../../motion/reveal'
import { useTick, S } from '../../motion/ticker'
import { FINE, RM, clamp, pad2 } from '../../motion/env'
import { projects, type Project } from '../../data/projects'
import '../../styles/sections.css'

const BASE = import.meta.env.BASE_URL

function links(p: Project): { label: string; href: string; primary: boolean }[] {
  const out: { label: string; href: string; primary: boolean }[] = []
  if (p.live) out.push({ label: 'Live', href: p.live, primary: true })
  if (p.github) out.push({ label: 'GitHub', href: p.github, primary: false })
  if (p.publication) out.push({ label: 'Publication', href: p.publication, primary: false })
  return out
}

/** Each letter twice, stacked: on hover the column rolls up to the accent copy. */
function Roll({ text }: { text: string }) {
  const words = text.split(' ')
  const starts = words.map((_, k) => words.slice(0, k).join('').length)
  return (
    <span className="roll" aria-hidden="true">
      {words.map((w, k) => (
        <span key={k}>
          <span className="wd">
            {[...w].map((c, j) => (
              <span key={j} className="rc" style={{ '--i': starts[k] + j } as CSSProperties}>
                <span>{c}</span>
                <span>{c}</span>
              </span>
            ))}
          </span>
          {k < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

/**
 * Projects (was "Work"): big rolling titles, siblings dim on hover, a preview
 * card trails the cursor and tilts with its speed, and rows open as an
 * accordion whose height tween retargets from wherever it currently is.
 */
export function Projects() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const bodies = useRef<(HTMLDivElement | null)[]>([])
  const pvRef = useRef<HTMLDivElement>(null)
  const [pvIndex, setPvIndex] = useState(0)
  const pv = useRef({ x: 0, y: 0, r: 0, shown: false, fresh: true })

  // Tween each body from its current height, so rapid toggles never jump.
  useLayoutEffect(() => {
    bodies.current.forEach((body, i) => {
      if (!body) return
      const want = openIndex === i
      if ((body.dataset.open === '1') === want) return
      body.dataset.open = want ? '1' : '0'
      body.style.height = getComputedStyle(body).height
      void body.offsetHeight // commit the start value
      body.style.height = want ? `${body.scrollHeight}px` : '0px'
      const done = (e: TransitionEvent) => {
        if (e.propertyName !== 'height') return
        if (body.dataset.open === '1') body.style.height = 'auto'
        body.removeEventListener('transitionend', done)
      }
      body.addEventListener('transitionend', done)
    })
  }, [openIndex])

  const hoverPreview = FINE && !RM

  useTick(() => {
    const s = pv.current, el = pvRef.current
    if (!el || (!s.shown && Math.abs(s.r) < 0.05)) return
    const tx = clamp(S.px + 36, 16, S.vw - 336), ty = clamp(S.py - 105, 16, S.vh - 226)
    if (s.fresh) { s.x = tx; s.y = ty; s.fresh = false }
    const px = s.x
    s.x += (tx - s.x) * 0.12
    s.y += (ty - s.y) * 0.12
    s.r += (clamp((s.x - px) * 0.6, -12, 12) - s.r) * 0.15
    el.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) rotate(${s.r.toFixed(2)}deg)`
  }, { enabled: hoverPreview })

  const onRowEnter = (i: number) => {
    if (!hoverPreview) return
    setPvIndex(i)
    if (!pv.current.shown) pv.current.fresh = true
    pv.current.shown = true
    pvRef.current?.classList.add('show')
  }
  const onListLeave = () => {
    pv.current.shown = false
    pvRef.current?.classList.remove('show')
  }

  return (
    <section id="projects" className="pad">
      <div className="wrap">
        <div className="sh" data-reveal="split" ref={reveal}>
          <span className="sh-num">02</span>
          <h2 aria-label="Projects"><Split text="Projects" /></h2>
          <i className="sh-line" />
        </div>
        <div className="work-list" data-cursor="dot" onPointerLeave={onListLeave}>
          {projects.map((p, i) => {
            const open = openIndex === i
            const ls = links(p)
            let k = 0
            return (
              <div
                key={p.title}
                className={`row${open ? ' open' : ''}`}
                data-reveal
                ref={reveal}
                style={{ '--d': `${i * 60}ms` } as CSSProperties}
                onPointerEnter={() => onRowEnter(i)}
              >
                <button
                  className="row-btn"
                  aria-expanded={open}
                  aria-controls={`rb-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span className="row-num">{pad2(i + 1)}</span>
                  <span>
                    <span className="row-title"><span className="sr">{p.title}</span><Roll text={p.title} /></span>
                    <span className="row-tag">{p.tagline}</span>
                  </span>
                  <span className="row-meta">
                    <span className="yr">{p.year}</span>
                    <span className="chips">{p.stack.slice(0, 4).map((s) => <i key={s}>{s}</i>)}</span>
                  </span>
                </button>
                <div
                  className="row-body"
                  id={`rb-${i}`}
                  role="region"
                  aria-label={p.title}
                  aria-hidden={!open}
                  ref={(el) => { bodies.current[i] = el }}
                >
                  <div className="row-body-in">
                    <p className="ac" style={{ '--i': k++ } as CSSProperties}>{p.description}</p>
                    <h4 className="ac" style={{ '--i': k++ } as CSSProperties}>Highlights</h4>
                    <ul>
                      {p.highlights.map((h) => <li key={h} className="ac" style={{ '--i': k++ } as CSSProperties}>{h}</li>)}
                    </ul>
                    {p.previews.length > 0 && (
                      <div className="row-prints ac" style={{ '--i': k++ } as CSSProperties}>
                        {p.previews.map((shot, j) => (
                          <img
                            key={shot.src}
                            src={`${BASE}${shot.src}`}
                            alt={shot.caption}
                            loading="lazy"
                            style={{ '--r': `${[-2.5, 1.8, -1.2][j % 3]}deg` } as CSSProperties}
                          />
                        ))}
                      </div>
                    )}
                    {ls.length > 0 && (
                      <div className="row-links ac" style={{ '--i': k++ } as CSSProperties}>
                        {ls.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`row-link${l.primary ? ' primary' : ''}`}
                            tabIndex={open ? undefined : -1}
                          >
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {hoverPreview && (
        <div className="pv" ref={pvRef} aria-hidden="true">
          <div className="pv-in">
            {projects.map((p, i) =>
              p.previews.length ? (
                <div key={p.title} className={`pv-card${pvIndex === i ? ' on' : ''}`}>
                  <img src={`${BASE}${p.previews[0].src}`} alt="" loading="lazy" />
                </div>
              ) : (
                <div key={p.title} className={`pv-card pv-gen${pvIndex === i ? ' on' : ''}`} style={{ '--h': p.hue } as CSSProperties}>
                  <span className="y">{p.year} — {pad2(i + 1)}</span>
                  <b>{p.title}</b>
                  <span className="c">{p.stack.slice(0, 3).map((s) => <i key={s}>{s}</i>)}</span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  )
}
