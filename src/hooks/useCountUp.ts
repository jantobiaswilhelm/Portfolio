import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const timeout = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        if (cancelled) return
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [target, duration, delay])

  return count
}
