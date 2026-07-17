import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface ScrollContext {
  scrollTo: (id: string) => void
}

const Ctx = createContext<ScrollContext>({ scrollTo: () => {} })

export const useSmoothScroll = () => useContext(Ctx)

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    lenisRef.current = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -60 })
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return <Ctx.Provider value={{ scrollTo }}>{children}</Ctx.Provider>
}
