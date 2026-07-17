import { describe, it, expect } from 'vitest'
import { stats } from './stats'

describe('derived stats', () => {
  it('counts all projects', () => {
    expect(stats.projects).toBe(6)
  })
  it('counts active projects', () => {
    expect(stats.active).toBe(4)
  })
  it('counts photo frames', () => {
    expect(stats.frames).toBe(30)
  })
})
