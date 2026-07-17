import { describe, it, expect } from 'vitest'
import { activeFromPositions } from './useActiveSection'

describe('activeFromPositions', () => {
  const threshold = 400
  it('returns the last section whose top is at or above the threshold', () => {
    const tops = [
      { id: 'hero', top: -500 },
      { id: 'about', top: 100 },
      { id: 'work', top: 900 },
    ]
    expect(activeFromPositions(tops, threshold)).toBe('about')
  })
  it('returns the first id when nothing has crossed yet', () => {
    const tops = [
      { id: 'hero', top: 800 },
      { id: 'about', top: 1600 },
    ]
    expect(activeFromPositions(tops, threshold)).toBe('hero')
  })
  it('returns empty string for no sections', () => {
    expect(activeFromPositions([], threshold)).toBe('')
  })
})
