import { useSyncExternalStore } from 'react'

/**
 * Camera sounds, synthesized with Web Audio (no files): the AF double-beep on
 * focus lock and a soft two-tick shutter. Off by default and opt-in — nobody
 * wants a portfolio that beeps unasked, and browsers block audio until a click
 * anyway. Everything stays at beep loudness with a soft attack; a louder
 * shutter jump-scared Jan in testing.
 */

const KEY = 'jw-sound'

function readStored(): boolean {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

let on = readStored()
let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
const listeners = new Set<() => void>()

function audio(): AudioContext | null {
  if (!ctx) {
    const AC = typeof window !== 'undefined'
      ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

const liveCtx = () => (on && audio()?.state === 'running' ? ctx : null)

// a remembered "on" still needs a gesture before the browser lets audio start
if (typeof window !== 'undefined') addEventListener('pointerdown', () => { if (on) audio() }, { passive: true })

export const isSoundOn = () => on

export function subscribeSound(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setSound(value: boolean, { quiet = false } = {}) {
  on = value
  try { localStorage.setItem(KEY, value ? '1' : '0') } catch { /* private mode */ }
  listeners.forEach((fn) => fn())
  // the toggle click is the gesture that unlocks audio; answer it with a beep
  if (value && !quiet && audio()) setTimeout(beep, 80)
}

export function useSound(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(subscribeSound, isSoundOn, () => false)
  return [value, (v) => setSound(v)]
}

function envelope(g: GainNode, t: number, peak: number, attack: number, hold: number, release: number) {
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.setValueAtTime(peak, t + attack + hold)
  g.gain.linearRampToValueAtTime(0, t + attack + hold + release)
}

/** AF confirm: the classic double beep. */
export function beep() {
  const c = liveCtx()
  if (!c || !master) return
  const t = c.currentTime
  for (const dt of [0, 0.085]) {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = 2700
    const g = c.createGain()
    envelope(g, t + dt, 0.07, 0.004, 0.04, 0.012)
    o.connect(g).connect(master)
    o.start(t + dt)
    o.stop(t + dt + 0.07)
  }
}

function noiseSource(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.ceil(c.sampleRate * 0.12), c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = c.createBufferSource()
  s.buffer = noiseBuf
  return s
}

/** One soft mechanical tick: band-limited noise with a 2ms fade-in and a barely-there low body. */
function tick(c: AudioContext, out: AudioNode, t: number, freq: number, len: number, level: number, body: number) {
  const n = noiseSource(c)
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.9
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5000
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + 0.002)
  g.gain.exponentialRampToValueAtTime(0.0005, t + len)
  n.connect(bp).connect(lp).connect(g).connect(out)
  n.start(t)
  n.stop(t + len + 0.01)
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(body, t)
  o.frequency.exponentialRampToValueAtTime(body * 0.6, t + 0.03)
  const og = c.createGain()
  og.gain.setValueAtTime(0, t)
  og.gain.linearRampToValueAtTime(level * 0.25, t + 0.003)
  og.gain.exponentialRampToValueAtTime(0.0005, t + 0.035)
  o.connect(og).connect(out)
  o.start(t)
  o.stop(t + 0.04)
}

/** Shutter release, mirrorless-quiet: a soft "tk-tk". */
export function shutter() {
  const c = liveCtx()
  if (!c || !master) return
  const t = c.currentTime + 0.005
  tick(c, master, t, 1900, 0.022, 0.09, 160)
  tick(c, master, t + 0.07, 1500, 0.03, 0.065, 130)
}
