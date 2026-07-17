import { useEffect, useRef, useState } from 'react'

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const countFrame = (elapsed: number, duration: number, target: number): number =>
  Math.round(easeOutCubic(Math.min(elapsed / duration, 1)) * target)

export function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const elapsed = ts - start
      setValue(countFrame(elapsed, duration, target))
      if (elapsed < duration) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, active, duration])

  return value
}
