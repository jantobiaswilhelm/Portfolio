import { describe, it, expect } from 'vitest'
import {
  WIDTHS,
  parseFolder,
  resolveAlt,
  sortPhotos,
  buildManifest,
  widthsFor,
} from './photos-lib.mjs'

describe('parseFolder', () => {
  it('splits a trailing four-digit year off the place', () => {
    expect(parseFolder('venice-2023')).toEqual({ place: 'Venice', year: '2023' })
  })

  it('title-cases a multi-word place', () => {
    expect(parseFolder('greater-bay-area-2025')).toEqual({
      place: 'Greater Bay Area',
      year: '2025',
    })
  })

  it('leaves the year undefined when the folder has none', () => {
    expect(parseFolder('basel')).toEqual({ place: 'Basel', year: undefined })
  })

  it('does not treat a bare year as a year', () => {
    expect(parseFolder('2023')).toEqual({ place: '2023', year: undefined })
  })
})

describe('resolveAlt', () => {
  it('defaults to place and year', () => {
    expect(resolveAlt('DSCF1.JPG', {}, 'Venice', '2023')).toEqual({
      alt: 'Venice, 2023',
      altIsDefault: true,
    })
  })

  it('defaults to place alone when there is no year', () => {
    expect(resolveAlt('DSCF1.JPG', {}, 'Basel', undefined)).toEqual({
      alt: 'Basel',
      altIsDefault: true,
    })
  })

  it('uses an override and flags it as not default', () => {
    const overrides = { 'DSCF1.JPG': 'Canal boats moored at dusk' }
    expect(resolveAlt('DSCF1.JPG', overrides, 'Venice', '2023')).toEqual({
      alt: 'Canal boats moored at dusk',
      altIsDefault: false,
    })
  })

  it('ignores a blank override', () => {
    expect(resolveAlt('DSCF1.JPG', { 'DSCF1.JPG': '   ' }, 'Venice', '2023')).toEqual({
      alt: 'Venice, 2023',
      altIsDefault: true,
    })
  })
})

describe('sortPhotos', () => {
  it('orders by capture date, newest first', () => {
    const photos = [
      { id: 'a', takenAt: '2021-01-01T00:00:00.000Z' },
      { id: 'b', takenAt: '2025-01-01T00:00:00.000Z' },
      { id: 'c', takenAt: '2023-01-01T00:00:00.000Z' },
    ]
    expect(sortPhotos(photos).map((p) => p.id)).toEqual(['b', 'c', 'a'])
  })

  it('puts undated photos last and breaks ties by id', () => {
    const photos = [
      { id: 'z' },
      { id: 'b', takenAt: '2025-01-01T00:00:00.000Z' },
      { id: 'a' },
    ]
    expect(sortPhotos(photos).map((p) => p.id)).toEqual(['b', 'a', 'z'])
  })
})

describe('buildManifest', () => {
  const photos = [
    { id: 'venice-2023/DSCF1', w: 6240, h: 4160, alt: 'Venice, 2023', altIsDefault: true },
  ]

  it('produces the documented shape', () => {
    const manifest = buildManifest(photos, 'venice-2023/DSCF1')
    expect(manifest.widths).toEqual(WIDTHS)
    expect(manifest.heroId).toBe('venice-2023/DSCF1')
    expect(manifest.photos).toHaveLength(1)
  })

  it('drops a heroId that names no known photo', () => {
    expect(buildManifest(photos, 'nope/missing').heroId).toBeNull()
  })

  it('returns an empty manifest for no photos without throwing', () => {
    const manifest = buildManifest([], null)
    expect(manifest.photos).toEqual([])
    expect(manifest.heroId).toBeNull()
    expect(manifest.widths).toEqual(WIDTHS)
  })
})

describe('widthsFor', () => {
  it('offers the full ladder for a large source', () => {
    expect(widthsFor(6240)).toEqual([400, 800, 1200, 1600])
  })

  it('never offers a width larger than the source', () => {
    expect(widthsFor(1440)).toEqual([400, 800, 1200])
  })

  it('handles a source between two rungs', () => {
    expect(widthsFor(500)).toEqual([400])
  })

  it('still yields one width for a source smaller than the smallest rung', () => {
    expect(widthsFor(300)).toEqual([400])
  })
})
