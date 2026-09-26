import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { addTick } from '../motion/ticker'

interface ScrollContext {
  /** Smooth-scroll to a section by id (the hero goes to the very top). */
  scrollTo: (id: string) => void
  /** Smooth-scroll to an absolute page offset. */
  scrollToY: (y: number, opts?: { duration?: number; immediate?: boolean }) => void
  setScrollLocked: (locked: boolean) => void
}

const Ctx = createContext<ScrollContext>({
  scrollTo: () => {},
  scrollToY: () => {},
  setScrollLocked: () => {},
})

// The hook lives next to its provider on purpose; fast refresh just reloads this file fully.
// eslint-disable-next-line react-refresh/only-export-components
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
    // Lenis steps first in the shared frame loop, so every effect reads this frame's scroll.
    const off = addTick((t) => lenis.raf(t), { first: true })
    return () => {
      off()
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  // Lenis keeps running behind a modal, so both it and native overflow are pinned.
  const setScrollLocked = useCallback((locked: boolean) => {
    if (locked) {
      lenisRef.current?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenisRef.current?.start()
      document.body.style.overflow = ''
    }
  }, [])

  const scrollToY = useCallback((y: number, opts: { duration?: number; immediate?: boolean } = {}) => {
    if (lenisRef.current) lenisRef.current.scrollTo(y, opts)
    else window.scrollTo({ top: y, behavior: reduced || opts.immediate ? 'auto' : 'smooth' })
  }, [reduced])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(id === 'hero' ? 0 : el, { offset: id === 'hero' ? 0 : -40, duration: 1.6 })
    } else {
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    }
  }, [reduced])

  return <Ctx.Provider value={{ scrollTo, scrollToY, setScrollLocked }}>{children}</Ctx.Provider>
}
