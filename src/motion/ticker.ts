import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * The one animation loop. Lenis registers as a `first` tick so every effect
 * reads the scroll position of the same frame; everything else hangs off this
 * instead of running its own requestAnimationFrame.
 */

export interface FrameState {
  /** window.scrollY this frame */
  y: number
  lastY: number
  /** smoothed scroll velocity in px per 60Hz frame (signed) */
  sv: number
  vw: number
  vh: number
  /** last pointer position (client coords); -1e4 until the pointer is seen */
  px: number
  py: number
  /** pointer is inside the window */
  pIn: boolean
  /** frame duration normalised to a 60Hz frame */
  dtN: number
}

const hasWindow = typeof window !== 'undefined'

export const S: FrameState = {
  y: hasWindow ? window.scrollY : 0,
  lastY: hasWindow ? window.scrollY : 0,
  sv: 0,
  vw: hasWindow ? window.innerWidth : 0,
  vh: hasWindow ? window.innerHeight : 0,
  px: -1e4,
  py: -1e4,
  pIn: false,
  dtN: 1,
}

export type Tick = (now: number) => void

const firstTicks = new Set<Tick>()
const ticks = new Set<Tick>()
let raf = 0
let last = 0
let listening = false

function listen() {
  if (listening || !hasWindow) return
  listening = true
  addEventListener('pointermove', (e) => { S.px = e.clientX; S.py = e.clientY; S.pIn = true }, { passive: true })
  addEventListener('pointerout', (e) => { if (!e.relatedTarget) S.pIn = false })
  addEventListener('blur', () => { S.pIn = false })
  addEventListener('resize', () => { S.vw = innerWidth; S.vh = innerHeight })
}

function loop(now: number) {
  raf = 0
  for (const f of firstTicks) f(now)
  const dt = Math.min(now - last, 50) || 16.67
  last = now
  S.dtN = dt / 16.67
  S.y = window.scrollY
  const raw = (S.y - S.lastY) / S.dtN
  S.lastY = S.y
  S.sv += (raw - S.sv) * 0.12
  for (const f of ticks) f(now)
  if (firstTicks.size + ticks.size > 0) raf = requestAnimationFrame(loop)
}

export function addTick(fn: Tick, opts: { first?: boolean } = {}): () => void {
  if (!hasWindow || typeof requestAnimationFrame !== 'function') return () => {}
  listen()
  ;(opts.first ? firstTicks : ticks).add(fn)
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }
  return () => {
    firstTicks.delete(fn)
    ticks.delete(fn)
    if (raf && firstTicks.size + ticks.size === 0) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

/** Subscribe a component to the frame loop; always calls the latest closure. */
export function useTick(fn: Tick, opts: { first?: boolean; enabled?: boolean } = {}) {
  const ref = useRef(fn)
  useLayoutEffect(() => { ref.current = fn })
  const { first = false, enabled = true } = opts
  useEffect(() => {
    if (!enabled) return
    return addTick((t) => ref.current(t), { first })
  }, [first, enabled])
}
