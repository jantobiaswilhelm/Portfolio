import { describe, it, expect } from 'vitest'
import { SECTIONS, SECTION_IDS } from './sections'

describe('sections registry', () => {
  it('starts with hero and ends with contact', () => {
    expect(SECTIONS[0].id).toBe('hero')
    expect(SECTIONS[SECTIONS.length - 1].id).toBe('contact')
  })
  it('numbers the non-hero sections 01..05', () => {
    const numbered = SECTIONS.filter((s) => s.num)
    expect(numbered.map((s) => s.num)).toEqual(['01', '02', '03', '04', '05'])
  })
  it('exposes ids in order', () => {
    expect(SECTION_IDS).toEqual(['hero', 'about', 'work', 'photography', 'travel', 'contact'])
  })
})
