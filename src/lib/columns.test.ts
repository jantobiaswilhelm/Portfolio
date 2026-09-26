import { describe, it, expect } from 'vitest'
import { columnCount, distribute, COLUMN_SPEEDS } from './columns'

describe('columnCount', () => {
  it('uses 2 columns on phones', () => {
    expect(columnCount(390)).toBe(2)
    expect(columnCount(599)).toBe(2)
  })
  it('steps up to 3, 4 and 5 columns as the viewport widens', () => {
    expect(columnCount(600)).toBe(3)
    expect(columnCount(999)).toBe(3)
    expect(columnCount(1000)).toBe(4)
    expect(columnCount(1399)).toBe(4)
    expect(columnCount(1400)).toBe(5)
    expect(columnCount(2560)).toBe(5)
  })
  it('has a parallax speed for every column of every layout', () => {
    for (const n of [2, 3, 4, 5]) expect(COLUMN_SPEEDS[n]).toHaveLength(n)
  })
})

describe('distribute', () => {
  const ar = (x: number) => x

  it('places every item exactly once, keeping indexes', () => {
    const items = [1.5, 0.66, 0.66, 1.5, 0.8]
    const cols = distribute(items, 3, ar)
    expect(cols).toHaveLength(3)
    const flat = cols.flat().map((c) => c.index).sort()
    expect(flat).toEqual([0, 1, 2, 3, 4])
  })

  it('fills the shortest column first (height = sum of 1/aspect)', () => {
    // a tall portrait (0.5 → height 2) in column 0 means the next two go elsewhere
    const cols = distribute([0.5, 1, 1], 2, ar)
    expect(cols[0].map((c) => c.index)).toEqual([0])
    expect(cols[1].map((c) => c.index)).toEqual([1, 2])
  })

  it('keeps reading order within a column', () => {
    const cols = distribute([1, 1, 1, 1, 1, 1], 2, ar)
    expect(cols[0].map((c) => c.index)).toEqual([0, 2, 4])
    expect(cols[1].map((c) => c.index)).toEqual([1, 3, 5])
  })

  it('returns empty columns when there is nothing to place', () => {
    expect(distribute([], 4, ar)).toEqual([[], [], [], []])
  })

  it('ignores degenerate aspect ratios instead of breaking the layout', () => {
    const cols = distribute([0, Number.NaN, 1], 2, ar)
    expect(cols.flat()).toHaveLength(3)
  })
})
