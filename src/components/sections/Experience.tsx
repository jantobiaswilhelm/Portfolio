import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { timeline, certifications, type TimelineItem } from '../../data/timeline'
import { languages } from '../../data/about'
import { useSmoothScroll } from '../../lib/smooth-scroll'
import {
  Y0, Y1, nowYear, spansOf, layLanes, xOf, playheadYear, detailTarget, barFill, scrubProgress, yy, type Span,
} from '../../lib/timeline-layout'
import { RM, EASE_OUT, animate, clamp } from '../../motion/env'
import { S, useTick } from '../../motion/ticker'
import { reveal } from '../../motion/reveal'
import { Split } from '../../motion/Split'

/** Lane pitch and bar height on the desktop timeline, px. */
const LANE = 44
const BAR_H = 34

const typeLabel = (t: TimelineItem) => (t.type === 'work' ? 'Work' : 'Education')
const barName = (t: TimelineItem) => `${t.title}${t.org ? `, ${t.org}` : ''}, ${t.year}`

interface BarState { el: HTMLButtonElement; fill: HTMLElement; lbl: HTMLElement; x: Span; f: number; lit: boolean; live: boolean; w: number; lw: number }
interface CertState { el: HTMLElement; burst: HTMLElement | null; y: number; lit: boolean }
interface YearState { el: HTMLElement; y: number; past: boolean }
interface EntState { el: HTMLElement; knot: HTMLElement; hit: boolean }

/**
 * Everything the frame loop reads and writes. It lives outside React's render
 * cycle: the component creates one per mount and only the functions below
 * mutate it (from effects, handlers and ticks — never during render).
 */
interface Stage {
  sec: HTMLElement | null
  pin: HTMLElement | null
  runway: HTMLElement | null
  axis: HTMLElement | null
  tracks: HTMLElement | null
  playhead: HTMLElement | null
  phLbl: HTMLElement | null
  dsY: HTMLElement | null
  dsCap: HTMLElement | null
  tl: HTMLElement | null
  tlFill: HTMLElement | null
  bars: BarState[]
  certs: CertState[]
  years: YearState[]
  plans: HTMLElement[]
  ents: EntState[]
  /** playhead year last drawn */
  ph: number
  year: number
  target: number
  hover: number | null
  dirty: boolean
  idle: boolean | null
  /** sticky offset of the stage, scrub distance, track width */
  top: number
  range: number
  w: number
  detailAnim: Animation | undefined
  firstDetail: boolean
}

const newStage = (): Stage => ({
  sec: null, pin: null, runway: null, axis: null, tracks: null, playhead: null, phLbl: null,
  dsY: null, dsCap: null, tl: null, tlFill: null,
  bars: [], certs: [], years: [], plans: [], ents: [],
  ph: -1, year: -1, target: -1, hover: null, dirty: true, idle: null,
  top: 0, range: 1, w: 0, detailAnim: undefined, firstDetail: true,
})

/** Gather per-element handles once the DOM exists. */
function collect(X: Stage, spans: Span[]) {
  const tracks = X.tracks!
  X.bars = Array.from(tracks.querySelectorAll<HTMLButtonElement>('.bar')).map((el) => ({
    el, fill: el.querySelector<HTMLElement>('.fill')!, lbl: el.querySelector<HTMLElement>('.lbl')!,
    x: spans[Number(el.dataset.i)], f: -1, lit: false, live: false, w: 0, lw: 0,
  }))
  X.certs = Array.from(tracks.querySelectorAll<HTMLElement>('.cert-pt')).map((el) => ({
    el, burst: el.querySelector<HTMLElement>('.burst'), y: Number(el.dataset.y), lit: false,
  }))
  X.years = Array.from(tracks.querySelectorAll<HTMLElement>('.yr')).map((el) => ({ el, y: Number(el.dataset.y), past: false }))
  X.plans = Array.from(tracks.querySelectorAll<HTMLElement>('.plan'))
  X.ents = Array.from(X.tl!.querySelectorAll<HTMLElement>('.ent')).map((el) => ({
    el, knot: el.querySelector<HTMLElement>('.knot')!, hit: false,
  }))
  markDetail(X, X.target)
}

function measureStage(X: Stage) {
  const { pin, tracks, runway } = X
  if (!pin || !tracks || !runway) return
  X.w = tracks.clientWidth
  // the sticky offset centres the stage, so it needs the stage's own height
  pin.style.setProperty('--pin-h', `${pin.offsetHeight}px`)
  X.top = parseFloat(getComputedStyle(pin).top) || 0
  X.range = Math.max(1, runway.offsetHeight)
  for (const b of X.bars) {
    b.w = b.el.offsetWidth
    b.lw = b.lbl.scrollWidth
    b.el.classList.toggle('narrow', b.w < b.lw + 20)
  }
  X.dirty = true
}

/** Highlight the bar the detail card is describing. */
function markDetail(X: Stage, target: number) {
  X.target = target
  X.bars.forEach((b) => b.el.classList.toggle('on', b.x.i === target))
}

/** Let a newly shown entry rise into the detail card (not on first paint). */
function animateDetail(X: Stage, el: HTMLElement | null) {
  if (X.firstDetail) { X.firstDetail = false; return }
  if (RM) return
  X.detailAnim?.cancel()
  X.detailAnim = animate(el, [
    { opacity: 0, transform: 'translate3d(0,10px,0)' },
    { opacity: 1, transform: 'none' },
  ], { duration: 320, easing: EASE_OUT })
}

/**
 * One desktop frame: the scrub starts the moment the stage sticks; the
 * playhead sweeps 2014 → now over the first 85% of the runway, then holds.
 * Returns the entry the detail card should show.
 */
function stepDesktop(X: Stage, spans: Span[], now: number): number | null {
  const { pin, sec } = X
  if (!pin || !sec || !pin.offsetParent) return null // phone layout: the stage is display:none
  const r = sec.getBoundingClientRect()
  if (r.top > S.vh || r.bottom < 0) return null
  const p = RM ? 1 : clamp((X.top - r.top) / X.range)
  const idle = !RM && p < 0.015
  if (idle !== X.idle) { X.idle = idle; X.axis?.classList.toggle('idle', idle) }
  const ph = RM ? now : playheadYear(p, Y0, now)
  const atNow = ph >= now - 0.02

  if (Math.abs(ph - X.ph) > 0.0005 || X.dirty) {
    X.ph = ph
    X.dirty = false
    X.playhead!.style.transform = `translate3d(${(xOf(ph) * X.w).toFixed(1)}px,0,0)`
    X.phLbl!.textContent = atNow ? 'NOW' : yy(ph)
    const yr = Math.floor(ph)
    if (yr !== X.year) {
      X.year = yr
      X.dsY!.textContent = yy(ph)
      if (!RM) animate(X.dsY, [{ opacity: 0.35, transform: 'translate3d(0,-10%,0)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: EASE_OUT })
    }
    X.dsCap!.textContent = atNow ? 'Now · Basel' : p > 0.01 ? 'Exposing…' : 'Scroll to expose'
    for (const b of X.bars) {
      const f = barFill(b.x, ph)
      if (Math.abs(f - b.f) > 0.001) { b.f = f; b.fill.style.transform = `scaleX(${f.toFixed(4)})` }
      const lit = b.el.classList.contains('narrow') ? f > 0 : f * b.w > b.lw + 12
      if (lit !== b.lit) { b.lit = lit; b.el.classList.toggle('lit', lit) }
      // the leading edge of a current role keeps exposing once you reach "now"
      const live = b.x.item.current && atNow
      if (live !== b.live) { b.live = live; b.el.classList.toggle('live', live) }
    }
    // the MSc's planned remainder only appears once you reach "now"
    X.plans.forEach((pl) => { pl.style.opacity = atNow ? '1' : '0' })
    for (const c of X.certs) {
      const lit = ph >= c.y
      if (lit === c.lit) continue
      c.lit = lit
      c.el.classList.toggle('lit', lit)
      // a flash each time the playhead crosses a certification
      if (lit && !RM) animate(c.burst, [
        { opacity: 0, transform: 'scale(.4)' },
        { opacity: 1, transform: 'scale(1.2)', offset: 0.25 },
        { opacity: 0, transform: 'scale(2.4)' },
      ], { duration: 520, easing: EASE_OUT })
    }
    for (const y of X.years) {
      const past = y.y <= ph
      if (past !== y.past) { y.past = past; y.el.classList.toggle('past', past) }
    }
  }
  return detailTarget(spans, ph, X.hover)
}

/** Phones: the line's tip rides a fixed viewport height; entries light up as it passes. */
function stepMobile(X: Stage) {
  const { tl, tlFill } = X
  if (!tl || !tlFill) return
  const r = tl.getBoundingClientRect()
  if (!r.height || r.top > S.vh || r.bottom < 0) return // hidden on desktop
  const head = S.vh * 0.62
  tlFill.style.transform = `scaleY(${(RM ? 1 : clamp((head - r.top) / r.height)).toFixed(4)})`
  for (const e of X.ents) {
    const hit = RM || e.knot.getBoundingClientRect().top + 6 <= head
    if (hit !== e.hit) { e.hit = hit; e.el.classList.toggle('hit', hit) }
  }
}

/**
 * Experience: a NOW block with the current roles first, then the whole CV as a
 * pinned "exposure timeline" — scroll drives a playhead from 2014 to now, bars
 * expose as it passes, certifications flash, a film-camera date stamp ticks.
 * Hover or focus a bar to inspect it; click to scrub there. Phones get a
 * vertical list whose line draws down as you scroll.
 */
export function Experience() {
  const { scrollToY } = useSmoothScroll()
  const [now] = useState(() => nowYear(new Date()))
  const spans = useMemo(() => spansOf(timeline, now), [now])
  const work = useMemo(() => layLanes(spans, 'work'), [spans])
  const edu = useMemo(() => layLanes(spans, 'edu'), [spans])
  const current = timeline.filter((t) => t.current)
  const [target, setTarget] = useState(() => detailTarget(spans, RM ? now : Y0, null))

  const secRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const runwayRef = useRef<HTMLDivElement>(null)
  const axisRef = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const phLblRef = useRef<HTMLElement>(null)
  const dsYRef = useRef<HTMLSpanElement>(null)
  const dsCapRef = useRef<HTMLElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<HTMLDivElement>(null)
  const tlFillRef = useRef<HTMLElement>(null)
  const stage = useRef<Stage | null>(null)

  // wire the stage to the DOM, then keep its geometry fresh
  useEffect(() => {
    const X = newStage()
    Object.assign(X, {
      sec: secRef.current, pin: pinRef.current, runway: runwayRef.current, axis: axisRef.current,
      tracks: tracksRef.current, playhead: playheadRef.current, phLbl: phLblRef.current,
      dsY: dsYRef.current, dsCap: dsCapRef.current, tl: tlRef.current, tlFill: tlFillRef.current,
      target: stage.current?.target ?? -1,
    })
    stage.current = X
    collect(X, spans)
    const measure = () => measureStage(X)
    measure()
    addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    if (X.pin) ro.observe(X.pin)
    if (X.tracks) ro.observe(X.tracks)
    return () => {
      removeEventListener('resize', measure)
      ro.disconnect()
      stage.current = null
    }
  }, [spans])

  // the detail card: highlight its bar, and let the new entry rise in
  useEffect(() => {
    const X = stage.current
    if (!X) return
    markDetail(X, target)
    animateDetail(X, detailRef.current)
  }, [target])

  /** Hovering or focusing a bar shows it in the detail card straight away. */
  const inspect = (i: number | null) => {
    const X = stage.current
    if (!X) return
    X.hover = i
    const next = detailTarget(spans, X.ph < 0 ? (RM ? now : Y0) : X.ph, i)
    if (next !== X.target) { X.target = next; setTarget(next) }
  }

  /** Clicking a bar scrubs the playhead to just inside it. */
  const scrubTo = (x: Span) => {
    const X = stage.current
    if (RM || !X || !secRef.current) return
    const top = secRef.current.getBoundingClientRect().top + window.scrollY
    scrollToY(top - X.top + scrubProgress(x, Y0, now) * X.range, { duration: 1.2 })
  }

  useTick(() => {
    const X = stage.current
    if (!X) return
    stepMobile(X)
    const next = stepDesktop(X, spans, now)
    if (next !== null && next !== X.target) { X.target = next; setTarget(next) }
  })

  // ruler: a major tick + label per year, three minor ticks between
  const ruler = useMemo(() => {
    const out: { y: number; k: number; major: boolean }[] = []
    let k = 0
    for (let y = Y0; y <= Math.floor(Y1); y++, k++) {
      out.push({ y, k, major: true })
      for (const q of [0.25, 0.5, 0.75]) if (y + q < Y1) out.push({ y: y + q, k, major: false })
    }
    return out
  }, [])

  const renderTrack = (type: TimelineItem['type'], label: string, lanes: { lanes: Map<number, number>; count: number }) => (
    <div className={`track t-${type}`} style={{ height: `${lanes.count * LANE - (LANE - BAR_H)}px` }}>
      <span className="lane-lbl" style={{ top: `${BAR_H / 2}px` }}>{label}</span>
      {spans.filter((x) => x.item.type === type).map((x) => {
        const top = (lanes.lanes.get(x.i) ?? 0) * LANE
        return (
          <Fragment key={x.i}>
            <button
              className="bar"
              data-type={type}
              data-i={x.i}
              style={{ left: `${xOf(x.s) * 100}%`, width: `${(xOf(x.e) - xOf(x.s)) * 100}%`, top: `${top}px` }}
              aria-label={barName(x.item)}
              onPointerEnter={() => inspect(x.i)}
              onPointerLeave={() => inspect(null)}
              onFocus={() => inspect(x.i)}
              onBlur={() => inspect(null)}
              onClick={() => scrubTo(x)}
            >
              <span className="fill" />
              <span className="lbl">{x.item.short}</span>
            </button>
            {x.plan !== null && (
              <span
                className="plan"
                style={{ left: `${xOf(x.e) * 100}%`, width: `${(xOf(x.plan) - xOf(x.e)) * 100}%`, top: `${top}px`, opacity: RM ? 1 : 0 }}
              >
                → {x.plan}
              </span>
            )}
          </Fragment>
        )
      })}
    </div>
  )

  const shown = timeline[target]

  return (
    <section id="experience">
      {/* NOW — what Jan is doing right now, the first thing you see */}
      <div className="wrap xp-intro">
        <div className="sh" data-reveal="split" ref={reveal}>
          <span className="sh-num">03</span>
          <h2 aria-label="Experience"><Split text="Experience" /></h2>
          <i className="sh-line" />
        </div>
        <div className="now-head" data-reveal ref={reveal}>
          <span className="live"><i />Now</span>
          <span className="now-sub">What I'm doing right now</span>
        </div>
        <div className="now-cards">
          {current.map((t, i) => (
            <article key={t.title} className="now-card" data-reveal ref={reveal} style={{ '--d': `${i * 120}ms` } as CSSProperties}>
              <div className="nc-top">
                <span className="nc-type">{t.type === 'work' ? 'Work' : 'Studying'}</span>
                <span className="nc-when">{t.year}</span>
              </div>
              <h3>{t.title}</h3>
              <div className="nc-org">{t.org}</div>
            </article>
          ))}
        </div>
        <div className="now-more" data-reveal ref={reveal} aria-hidden="true"><span>The whole timeline</span><i /></div>
      </div>

      {/* desktop: the exposure timeline — sits right under NOW, pins where it arrives */}
      <div className="xp-sec" ref={secRef}>
        <div className="xp-pin" ref={pinRef}>
          <div className="wrap">
            <div className="xp-head">
              <div className="datestamp" aria-hidden="true">
                <span className="ds-y" ref={dsYRef}>{yy(RM ? now : Y0)}</span>
                <small ref={dsCapRef}>Scroll to expose</small>
              </div>
              <div className="detail">
                <div className="detail-in" ref={detailRef}>
                  <div className="d-meta">
                    <span className={`tag ${shown.type}`}>{typeLabel(shown)}</span>
                    {shown.current && <span className="tag now">Now</span>}
                    <span>{shown.year}</span>
                  </div>
                  <h3>{shown.title}</h3>
                  {shown.org && <div className="d-org">{shown.org}</div>}
                </div>
              </div>
            </div>
            <div className="axis" data-reveal="split" ref={(el) => { axisRef.current = el; return reveal(el) }}>
              <div className="tracks" ref={tracksRef}>
                {renderTrack('work', 'Work', work)}
                <div className="ruler" aria-hidden="true">
                  {ruler.map((t) => t.major ? (
                    <Fragment key={t.y}>
                      <i className="tick maj" style={{ left: `${xOf(t.y) * 100}%`, '--k': t.k } as CSSProperties} />
                      <span className="yr" data-y={t.y} style={{ left: `${xOf(t.y) * 100}%`, '--k': t.k } as CSSProperties}>{t.y}</span>
                    </Fragment>
                  ) : (
                    <i key={t.y} className="tick min" style={{ left: `${xOf(t.y) * 100}%`, '--k': t.k } as CSSProperties} />
                  ))}
                </div>
                {renderTrack('edu', 'Education', edu)}
                <div className="track t-cert" style={{ height: '30px' }}>
                  <span className="lane-lbl" style={{ top: '15px' }}>Certs</span>
                  {certifications.map((c) => (
                    <span
                      key={c.name}
                      className="cert-pt"
                      role="img"
                      data-y={Number(c.year) + 0.5}
                      style={{ left: `${xOf(Number(c.year) + 0.5) * 100}%` }}
                      aria-label={`${c.name}, ${c.level}, ${c.year}`}
                    >
                      <i className="burst" />
                      <span className="clbl" aria-hidden="true">{c.short}</span>
                    </span>
                  ))}
                </div>
                <div className="playhead" ref={playheadRef} aria-hidden="true"><b ref={phLblRef}>{yy(Y0)}</b></div>
                <div className="xp-ghost" aria-hidden="true"><i /></div>
                <div className="xp-hint" aria-hidden="true"><b>↓</b>Scroll to expose the timeline</div>
              </div>
            </div>
            <div className="xp-foot"><span>Languages<b className="lang-list">{languages.join(' · ')}</b></span></div>
          </div>
        </div>
        <div className="xp-runway" ref={runwayRef} aria-hidden="true" />
      </div>

      {/* phones: the drawing-line list */}
      <div className="xp-mobile wrap">
        <div className="xp">
          <aside className="xp-aside">
            <div data-reveal ref={reveal}>
              <div className="xp-label">Certifications</div>
              <div className="certs">
                {certifications.map((c) => (
                  <div key={c.name} className="cert">
                    <div><b>{c.name}</b><small>{c.lang}</small></div>
                    <span>{c.level} · {c.year}</span>
                  </div>
                ))}
              </div>
            </div>
            <div data-reveal ref={reveal} style={{ '--d': '100ms' } as CSSProperties}>
              <div className="xp-label">Languages</div>
              <div className="langs">{languages.map((l) => <span key={l}>{l}</span>)}</div>
            </div>
          </aside>
          <div className="tl" ref={tlRef}>
            <div className="tl-line"><i ref={tlFillRef} /></div>
            {timeline.map((t) => (
              <div key={t.title} className={`ent${t.current ? ' cur' : ''}`}>
                <span className="knot" aria-hidden="true" />
                <div className="ent-year">{t.year}</div>
                <div className="ent-body">
                  <h3>{t.title}</h3>
                  {t.org && <div className="org">{t.org}</div>}
                  <div className="tags">
                    <span className={`tag ${t.type}`}>{typeLabel(t)}</span>
                    {t.current && <span className="tag now">Now</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
