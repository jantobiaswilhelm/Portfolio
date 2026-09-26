import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Drive the loop by hand: capture the rAF callback instead of waiting for frames.
let queued: FrameRequestCallback | null = null
beforeEach(() => {
  queued = null
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { queued = cb; return 1 })
  vi.stubGlobal('cancelAnimationFrame', () => { queued = null })
  vi.resetModules()
})
afterEach(() => vi.unstubAllGlobals())

const frame = (t: number) => { const cb = queued; queued = null; cb?.(t) }

describe('ticker', () => {
  it('runs subscribers every frame until they unsubscribe', async () => {
    const { addTick } = await import('./ticker')
    const fn = vi.fn()
    const off = addTick(fn)
    frame(16); frame(32)
    expect(fn).toHaveBeenCalledTimes(2)
    off()
    frame(48)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('runs `first` subscribers (smooth scroll) before everything else', async () => {
    const { addTick } = await import('./ticker')
    const order: string[] = []
    addTick(() => order.push('effect'))
    addTick(() => order.push('lenis'), { first: true })
    frame(16)
    expect(order).toEqual(['lenis', 'effect'])
  })

  it('stops requesting frames when nobody is subscribed', async () => {
    const { addTick } = await import('./ticker')
    const off = addTick(() => {})
    expect(queued).not.toBeNull()
    off()
    frame(16)
    expect(queued).toBeNull()
  })

  it('tracks scroll position and a smoothed scroll velocity', async () => {
    const { addTick, S } = await import('./ticker')
    addTick(() => {})
    window.scrollY = 0
    frame(16)
    window.scrollY = 100
    frame(32)
    expect(S.y).toBe(100)
    expect(S.sv).toBeGreaterThan(0)
    expect(S.sv).toBeLessThan(100) // smoothed, not raw
    window.scrollY = 0
  })
})
