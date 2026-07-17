import { describe, it, expect } from 'vitest'
import { easeOutCubic, countFrame } from './useCountUp'

describe('count-up math', () => {
  it('easeOutCubic is 0 at start and 1 at end', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })
  it('countFrame returns 0 at elapsed 0', () => {
    expect(countFrame(0, 1000, 30)).toBe(0)
  })
  it('countFrame returns the target at/after duration', () => {
    expect(countFrame(1000, 1000, 30)).toBe(30)
    expect(countFrame(5000, 1000, 30)).toBe(30)
  })
  it('countFrame is monotonic and within [0,target]', () => {
    const a = countFrame(250, 1000, 30)
    const b = countFrame(750, 1000, 30)
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(30)
    expect(b).toBeGreaterThanOrEqual(a)
  })
})
