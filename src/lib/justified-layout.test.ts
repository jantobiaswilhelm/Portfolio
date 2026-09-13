import { describe, it, expect } from 'vitest'
import { layoutRows } from './justified-layout'

const CONTAINER = 1200
const TARGET = 300
const GUTTER = 8

describe('layoutRows', () => {
  it('returns nothing for an empty set', () => {
    expect(layoutRows([], CONTAINER, TARGET, GUTTER)).toEqual([])
  })

  it('returns nothing when the container has no width', () => {
    expect(layoutRows([1.5, 1.5], 0, TARGET, GUTTER)).toEqual([])
  })

  it('fills every full row to exactly the container width', () => {
    const aspects = [1.5, 1.5, 0.66, 1.5, 1.5, 0.66, 1.5, 1.5]
    const rows = layoutRows(aspects, CONTAINER, TARGET, GUTTER)
    const full = rows.slice(0, -1)
    expect(full.length).toBeGreaterThan(0)
    for (const row of full) {
      const used =
        row.tiles.reduce((sum, t) => sum + t.width, 0) + GUTTER * (row.tiles.length - 1)
      expect(used).toBeCloseTo(CONTAINER, 1)
    }
  })

  it('does not stretch the last row', () => {
    const rows = layoutRows([1.5, 1.5, 0.66, 1.5, 1.5], CONTAINER, TARGET, GUTTER)
    const last = rows[rows.length - 1]
    const used =
      last.tiles.reduce((sum, t) => sum + t.width, 0) + GUTTER * (last.tiles.length - 1)
    expect(used).toBeLessThan(CONTAINER)
    expect(last.height).toBeLessThanOrEqual(TARGET)
  })

  it('never distorts an aspect ratio', () => {
    const aspects = [1.5, 0.66, 2.4, 1.0, 1.5]
    const rows = layoutRows(aspects, CONTAINER, TARGET, GUTTER)
    for (const row of rows) {
      for (const tile of row.tiles) {
        expect(tile.width / tile.height).toBeCloseTo(aspects[tile.index], 5)
      }
    }
  })

  it('scales a single oversized photo down to fit', () => {
    const rows = layoutRows([5], CONTAINER, TARGET, GUTTER)
    expect(rows).toHaveLength(1)
    expect(rows[0].tiles[0].width).toBeCloseTo(CONTAINER, 1)
    expect(rows[0].height).toBeLessThan(TARGET)
  })

  it('leaves a single small photo at the target height', () => {
    const rows = layoutRows([1.5], CONTAINER, TARGET, GUTTER)
    expect(rows[0].height).toBeCloseTo(TARGET, 5)
  })

  it('returns every photo exactly once, in order', () => {
    const aspects = [1.5, 0.66, 2.4, 1.0, 1.5, 1.5, 0.8]
    const rows = layoutRows(aspects, CONTAINER, TARGET, GUTTER)
    const seen = rows.flatMap((r) => r.tiles.map((t) => t.index))
    expect(seen).toEqual(aspects.map((_, i) => i))
  })
})
