import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import '../../styles/hero.css'
import { roles } from '../../data/about'
import { stats } from '../../data/stats'
import { findPhoto, heroId, largestWidth, photoSrcSet, photoUrl, type Photo } from '../../data/photos-manifest'
import { S, useTick } from '../../motion/ticker'
import { RM, EASE_MOVE, EASE_OUT, animate, clamp, easeInOut, easeOutCubic, lerp, settled } from '../../motion/env'
import { cursor, pulseAf, setAfState } from '../../motion/cursor'
import { beep, shutter, useSound } from '../../motion/sound'
import { isHeroIn, markHeroReady, onHeroIn } from '../../motion/intro'
import { Split, splitCount } from '../../motion/Split'

const BASE = import.meta.env.BASE_URL
const PORTRAIT = { webp: `${BASE}images/portrait-oeschinensee.webp`, jpg: `${BASE}images/portrait-oeschinensee.jpg` }

const exifLine = (p: Photo) =>
  [p.focalLength, p.aperture, p.iso && `ISO ${p.iso}`].filter(Boolean).join(' · ') || p.place.toUpperCase()

/** Smallest derivative at least 800px wide — the blurred plane never needs more. */
const softWidth = (p: Photo) => p.widths.find((w) => w >= 800) ?? largestWidth(p)

const STATS = [
  { value: stats.projects, label: 'Projects' },
  { value: stats.active, label: 'Active now' },
  { value: stats.frames, label: 'Frames' },
]

interface Geometry {
  cx: number; cy: number; s: number; shift: number
  rest: { cx: number; cy: number; w: number }
  target: { cx: number; cy: number; w: number }
  heroTop: number; heroRange: number
}

/**
 * The hero, as in prototype D: the photo develops in, focus racks from the lake
 * onto Jan under the AF cursor, and scrolling shrinks it into a paper print with
 * his portrait print laid across its corner — the shutter fires as it lands.
 */
export function Hero() {
  const hero = findPhoto(heroId)
  const [sound, setSound] = useSound()
  const cueId = `cue-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const softRef = useRef<HTMLImageElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const portraitRef = useRef<HTMLElement>(null)
  const portraitImgRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const roleRef = useRef<HTMLSpanElement>(null)
  const statRefs = useRef<(HTMLElement | null)[]>([])
  const hintRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)

  // Rack focus: f = 0 → background plane sharp, 1 → you (name + portrait) sharp.
  const F = useRef({ f: RM ? 1 : 0, fT: RM ? 1 : 0, last: -1, locked: false, lastMove: 0, lockX: 0, lockY: 0, user: false, heroP: 0 })
  const beepState = useRef({ lastBeep: 0, plane: -1, bx: -1e4, by: -1e4 })
  const G = useRef<Geometry | null>(null)
  const dirty = useRef(true)
  const heroY = useRef(-1)
  // Idle tease: until the first scroll the hero previews its own scroll every few seconds.
  const tease = useRef({ at: 0, v: 0, done: false })
  // The shot fires once per pass; starts disarmed so a restored scroll position can't fire it on load.
  const shot = useRef({ armed: false })

  const aim = (near: boolean) => {
    const f = F.current
    f.fT = near ? 1 : 0
    f.lastMove = performance.now()
    f.locked = false
    setAfState('hunting')
  }

  // Text the JS animates is set imperatively, so React never owns (and resets) it.
  useLayoutEffect(() => {
    if (roleRef.current) roleRef.current.textContent = roles[0]
    statRefs.current.forEach((el, i) => { if (el) el.textContent = RM ? String(STATS[i].value) : '0' })
  }, [])

  // Tell the loader once the hero photo is decoded (or give up waiting on error).
  useEffect(() => {
    const img = imgRef.current
    if (!img) { markHeroReady(); return }
    const done = () => markHeroReady()
    if (typeof img.decode === 'function') img.decode().then(done, done)
    else if (img.complete) done()
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
    return () => { img.removeEventListener('load', done); img.removeEventListener('error', done) }
  }, [])

  // Print geometry: crop the full-bleed layer to 3:2 and scale it to print size;
  // the portrait print comes to rest across the big print's lower-right corner.
  useEffect(() => {
    const measure = () => {
      const pin = pinRef.current, hp = portraitRef.current, paper = paperRef.current, section = sectionRef.current
      if (!pin || !hp || !paper || !section) return
      const vw = innerWidth, vh = innerHeight, AR = 1.5
      let cx = 0, cy = 0
      if (vw / vh > AR) cx = (vw - vh * AR) / 2
      else cy = (vh - vw / AR) / 2
      const Wc = vw - 2 * cx
      const printW = vw < 700 ? vw - 56 : Math.min(vw * 0.52, 800, vh * 0.58 * AR)
      const s = printW / Wc, printH = printW / AR
      const padS = vw < 700 ? 10 : 14, padB = vw < 700 ? 38 : 46
      const shift = (padB - padS) / 2
      const pL = (vw - printW) / 2 - padS, pT = (vh - printH) / 2 - shift - padS
      const pW = printW + padS * 2, pH = printH + padS + padB
      Object.assign(paper.style, { width: `${pW}px`, height: `${pH}px`, left: `${pL}px`, top: `${pT}px` })
      // portrait rest rect, relative to the pin, with our transform removed
      const prev = hp.style.transform
      hp.style.transform = 'none'
      const pr = pin.getBoundingClientRect(), r = hp.getBoundingClientRect()
      hp.style.transform = prev
      const rest = { cx: r.left - pr.left + r.width / 2, cy: r.top - pr.top + r.height / 2, w: r.width || 1 }
      const tw = vw < 700 ? pW * 0.34 : pW * 0.3
      const target = { cx: pL + pW - tw * 0.28, cy: pT + pH - tw * 0.52, w: tw }
      const heroTop = section.getBoundingClientRect().top + scrollY
      G.current = { cx, cy, s, shift, rest, target, heroTop, heroRange: Math.max(1, section.offsetHeight - vh) }
      dirty.current = true
    }
    measure()
    let timer = 0
    const onResize = () => { clearTimeout(timer); timer = window.setTimeout(measure, 150) }
    addEventListener('resize', onResize)
    addEventListener('load', measure)
    document.fonts?.ready.then(measure)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null
    if (ro && pinRef.current) ro.observe(pinRef.current)
    return () => {
      clearTimeout(timer)
      removeEventListener('resize', onResize)
      removeEventListener('load', measure)
      ro?.disconnect()
    }
  }, [])

  // Pointer / touch focus. Pointing at you (.near) racks onto you, anywhere else onto the lake.
  useEffect(() => {
    const pin = pinRef.current
    if (RM || !pin) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !isHeroIn()) return
      const f = F.current
      f.user = true
      const moved = Math.hypot(e.clientX - f.lockX, e.clientY - f.lockY) > 5
      const near = !!(e.target as Element).closest('.near')
      if (f.locked && !moved && (near ? 1 : 0) === f.fT) return
      aim(near)
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      F.current.user = true
      aim(!!(e.target as Element).closest('.near'))
    }
    const onLeave = () => { if (isHeroIn()) aim(true) }
    pin.addEventListener('pointermove', onMove)
    pin.addEventListener('pointerdown', onDown)
    pin.addEventListener('pointerleave', onLeave)
    return () => {
      pin.removeEventListener('pointermove', onMove)
      pin.removeEventListener('pointerdown', onDown)
      pin.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // When the loader hands over: count up, rotate roles, and — the opening shot —
  // rack focus from the lake onto Jan unless the visitor already took control.
  useEffect(() => {
    let rolesTimer = 0, rackTimer = 0, alive = true
    const rafs: number[] = []
    const off = onHeroIn(() => {
      // stat counters
      statRefs.current.forEach((el, i) => {
        if (!el) return
        const target = STATS[i].value
        if (RM || typeof requestAnimationFrame !== 'function') { el.textContent = String(target); return }
        const t0 = performance.now() + 900
        const step = (now: number) => {
          if (!alive) return
          const t = clamp((now - t0) / 1300)
          el.textContent = String(Math.round(easeOutCubic(t) * target))
          if (t < 1) rafs.push(requestAnimationFrame(step))
        }
        rafs.push(requestAnimationFrame(step))
      })
      // role rotator: out through the top, next one in from below
      let i = 0
      rolesTimer = window.setInterval(async () => {
        const el = roleRef.current
        if (!el) return
        const next = roles[(i = (i + 1) % roles.length)]
        if (RM) { el.textContent = next; return }
        el.getAnimations?.().forEach((a) => a.cancel())
        const out = animate(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }], { duration: 420, easing: EASE_MOVE, fill: 'forwards' })
        await settled(out, 420)
        out?.cancel()
        if (!alive) return
        el.textContent = next
        animate(el, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 620, easing: EASE_OUT, fill: 'forwards' })
      }, 2600)
      if (!RM) rackTimer = window.setTimeout(() => { if (!F.current.user) aim(true) }, 1900)
    })
    return () => {
      alive = false
      off()
      clearInterval(rolesTimer)
      clearTimeout(rackTimer)
      rafs.forEach((r) => cancelAnimationFrame(r))
    }
  }, [])

  // Rack focus + AF lock. Scrolling clears the rack so the print on the table is sharp.
  useTick((now) => {
    const f = F.current
    cursor.afAllowed = isHeroIn() && f.heroP <= 0.1
    if (RM) return
    f.f += (f.fT - f.f) * 0.085
    const clear = clamp(f.heroP * 3)
    const k = f.f * (1 - clear), blur = (1 - f.f) * 7 * (1 - clear)
    const sig = k + blur * 10
    if (Math.abs(sig - f.last) > 0.004) {
      f.last = sig
      if (softRef.current) softRef.current.style.opacity = k.toFixed(3)
      const b = blur < 0.05 ? 'none' : `blur(${blur.toFixed(2)}px)`
      if (nameRef.current) nameRef.current.style.filter = b
      if (portraitImgRef.current) portraitImgRef.current.style.filter = b
    }
    // AF lock: the lagging ring has caught the pointer and focus has settled
    if (cursor.mode === 'af' && !f.locked && cursor.seen) {
      const caught = Math.hypot(S.px - cursor.rx, S.py - cursor.ry) < 1.5
      if (caught && Math.abs(f.f - f.fT) < 0.03 && now - f.lastMove > 180) {
        f.locked = true; f.lockX = S.px; f.lockY = S.py
        setAfState('locked', f.fT > 0.5 ? 'AF-S ● 1.2m' : 'AF-S ● ∞')
        pulseAf()
        // beep on a real refocus — a new plane or a new spot — never on every tiny re-lock
        const bs = beepState.current
        const newSpot = Math.hypot(S.px - bs.bx, S.py - bs.by) > 140
        if ((f.fT !== bs.plane || newSpot) && now - bs.lastBeep > 350) {
          beep(); bs.lastBeep = now; bs.plane = f.fT; bs.bx = S.px; bs.by = S.py
        }
      }
    }
  })

  // Scroll: the photo shrinks into a print, the name splits, the portrait lands on the corner.
  useTick((now) => {
    const g = G.current
    if (RM || !g) return
    const t = tease.current
    let tv = 0
    const html = document.documentElement
    if (!t.done && isHeroIn() && !html.classList.contains('is-loading')) {
      if (S.y > 4) t.done = true
      else {
        if (!t.at) t.at = now + 4200 // first one 4.2s after the hero lands
        const kk = (now - t.at) / 1500
        if (kk >= 1) t.at = now + 5000 // then every ~6.5s
        else if (kk > 0) tv = 0.085 * Math.sin(Math.PI * kk) ** 2
      }
    }
    if (S.y === heroY.current && !dirty.current && tv === t.v) return
    heroY.current = S.y; dirty.current = false; t.v = tv
    const cue = cueRef.current, hint = hintRef.current, layer = layerRef.current, paper = paperRef.current
    if (cue) cue.style.transform = tv ? `scale(${(1 + tv * 1.6).toFixed(4)})` : ''
    const p = clamp((S.y - g.heroTop) / g.heroRange)
    F.current.heroP = p
    // the print lands → the shot is taken; re-arms after scrolling back up past ~70%
    if (p >= 0.995 && shot.current.armed) {
      shot.current.armed = false
      shutter()
      const pop = [{ filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }]
      animate(layer, pop, { duration: 380, easing: EASE_OUT })
      animate(paper, pop, { duration: 380, easing: EASE_OUT })
    } else if (p < 0.7) shot.current.armed = true
    const e = Math.max(easeInOut(p), tv)
    if (layer) {
      layer.style.clipPath = `inset(${g.cy * e}px ${g.cx * e}px ${g.cy * e}px ${g.cx * e}px round ${(3 / g.s) * e}px)`
      layer.style.transform = `translate3d(0,${-g.shift * e}px,0) scale(${lerp(1, g.s, e)})`
    }
    if (shadeRef.current) shadeRef.current.style.opacity = String(1 - clamp(p * 1.6))
    if (paper) {
      const pe = clamp((p - 0.55) / 0.4)
      paper.style.opacity = String(pe)
      paper.style.transform = `scale(${lerp(1.08, 1, easeOutCubic(pe))})`
    }
    if (contentRef.current) {
      contentRef.current.style.opacity = String(1 - clamp(p * 2.2))
      contentRef.current.style.transform = `translate3d(0,${-p * 9}vh,0)`
    }
    if (line1Ref.current) line1Ref.current.style.transform = `translate3d(${-e * 16}vw,0,0)`
    if (line2Ref.current) line2Ref.current.style.transform = `translate3d(${e * 16}vw,0,0)`
    const fade = 1 - clamp(p * 6)
    const op = fade === 1 ? '' : String(fade) // leave the CSS intro fade alone at rest
    if (cue) cue.style.opacity = op
    if (hint) {
      hint.style.opacity = op
      hint.style.pointerEvents = fade < 0.5 ? 'none' : '' // no clicking an invisible sound button
    }
    // the portrait lags the print a little, then drops onto its corner
    const hp = portraitRef.current
    if (hp) {
      const e2 = easeInOut(clamp((p - 0.12) / 0.88))
      const { rest, target } = g
      hp.style.transform = `translate3d(${(target.cx - rest.cx) * e2}px,${(target.cy - rest.cy) * e2}px,0) scale(${lerp(1, target.w / rest.w, e2)}) rotate(${lerp(0, 5, e2)}deg)`
    }
  })

  const place = hero ? `${hero.place.toUpperCase()}${hero.year ? `, ${hero.year}` : ''}` : ''

  return (
    <section id="hero" className="hero" ref={sectionRef}>
      <div className="hero-pin" data-cursor="af" ref={pinRef}>
        <div className="paper" ref={paperRef}>
          <div className="cap"><span>{place}</span><span>{hero ? exifLine(hero) : ''}</span></div>
        </div>
        <div className="hero-layer" ref={layerRef}>
          {hero && (
            <>
              <picture>
                <source type="image/avif" srcSet={photoSrcSet(hero, 'avif')} sizes="100vw" />
                <source type="image/webp" srcSet={photoSrcSet(hero, 'webp')} sizes="100vw" />
                <img
                  ref={imgRef}
                  className="hero-img"
                  src={photoUrl(hero.id, largestWidth(hero), 'jpg')}
                  srcSet={photoSrcSet(hero, 'jpg')}
                  sizes="100vw"
                  alt=""
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
              {/* the out-of-focus plane: blurred once in CSS, only its opacity ever moves */}
              <img ref={softRef} className="hero-soft" src={photoUrl(hero.id, softWidth(hero), 'webp')} alt="" decoding="async" />
            </>
          )}
          <div className="hero-shade" ref={shadeRef} />
        </div>

        <figure className="hero-portrait near" ref={portraitRef}>
          <div className="pframe">
            <picture>
              <source type="image/webp" srcSet={PORTRAIT.webp} />
              <img ref={portraitImgRef} src={PORTRAIT.jpg} alt="Jan Wilhelm sitting on a rock at Oeschinensee" width={900} height={1047} />
            </picture>
            <figcaption><span>J. WILHELM</span><span>OESCHINENSEE '26</span></figcaption>
          </div>
        </figure>

        <div className="hero-content" ref={contentRef}>
          <div className="wrap">
            <div className="eyebrow"><span>Basel, Switzerland</span></div>
            <h1 className="near" aria-label="Jan Wilhelm." ref={nameRef}>
              <span className="line" ref={line1Ref}><Split text="Jan" /></span>
              <span className="line" ref={line2Ref}>
                <Split text="Wilhelm" start={splitCount('Jan')} />
                <span className="accent"><Split text="." start={splitCount('JanWilhelm')} /></span>
              </span>
            </h1>
            <div className="hero-meta near">
              <div className="role">
                I'm a <span className="role-mask"><span className="role-word" ref={roleRef} /></span>
              </div>
              <div className="stats">
                {STATS.map((s, i) => (
                  <div className="stat" key={s.label}>
                    <b ref={(el) => { statRefs.current[i] = el }} />
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hint" ref={hintRef}>
          <span aria-hidden="true">◎ Point to pull focus ·</span>{' '}
          <button className="snd-inline" tabIndex={-1} aria-hidden="true" aria-pressed={sound} onClick={() => setSound(!sound)}>
            {sound ? 'Sound on' : 'Turn on sound'}
          </button>
        </div>

        <div className="cue" ref={cueRef} aria-hidden="true">
          <svg className="cue-ring" viewBox="0 0 100 100">
            <defs><path id={cueId} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
            <text>
              <textPath href={`#${cueId}`} textLength={236} lengthAdjust="spacing">SCROLL TO DEVELOP · SCROLL TO DEVELOP ·</textPath>
            </text>
          </svg>
          <span className="cue-dot"><i>↓</i></span>
        </div>
      </div>
    </section>
  )
}
