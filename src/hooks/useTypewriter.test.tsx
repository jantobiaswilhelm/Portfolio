import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

afterEach(() => vi.useRealTimers())

describe('useTypewriter', () => {
  it('starts empty and types characters of the first word over time', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTypewriter(['Dev'], { typeMs: 50 }))
    expect(result.current).toBe('')
    act(() => { vi.advanceTimersByTime(50) })
    expect(result.current).toBe('D')
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('Dev')
  })
})
