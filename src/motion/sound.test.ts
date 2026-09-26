import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('sound', () => {
  it('is off by default — a portfolio should never make noise unasked', async () => {
    const { isSoundOn } = await import('./sound')
    expect(isSoundOn()).toBe(false)
  })

  it('remembers the choice across visits', async () => {
    const { setSound } = await import('./sound')
    setSound(true, { quiet: true })
    expect(localStorage.getItem('jw-sound')).toBe('1')
    vi.resetModules()
    const again = await import('./sound')
    expect(again.isSoundOn()).toBe(true)
  })

  it('notifies subscribers when toggled', async () => {
    const { setSound, subscribeSound } = await import('./sound')
    const fn = vi.fn()
    subscribeSound(fn)
    setSound(true, { quiet: true })
    expect(fn).toHaveBeenCalled()
  })

  it('stays silent and never throws where Web Audio is missing', async () => {
    const { setSound, beep, shutter } = await import('./sound')
    setSound(true)
    expect(() => { beep(); shutter() }).not.toThrow()
  })
})
