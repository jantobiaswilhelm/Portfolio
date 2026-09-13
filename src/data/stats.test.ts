import { describe, it, expect } from 'vitest'
import { stats } from './stats'
import { photos } from './photos-manifest'

describe('derived stats', () => {
  it('counts all projects', () => {
    expect(stats.projects).toBe(6)
  })
  it('counts active projects', () => {
    expect(stats.active).toBe(4)
  })
  it('counts photo frames off the manifest', () => {
    expect(stats.frames).toBe(photos.length)
  })
  it('reads the manifest as a list', () => {
    expect(Array.isArray(photos)).toBe(true)
  })
})
