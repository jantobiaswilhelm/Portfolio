import { useEffect, useRef, useCallback, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/ui/Footer'

const pages = ['/about', '/work', '/photography']

export default function RootLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Scroll progress bar
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentIndex = pages.indexOf(pathname)
  const isSubpage = currentIndex !== -1
  const prevPage = isSubpage && currentIndex > 0 ? pages[currentIndex - 1] : null
  const nextPage = isSubpage && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null

  const pageLabel = (path: string) => {
    if (path === '/about') return 'About'
    if (path === '/work') return 'CV & Projects'
    if (path === '/photography') return 'Photography'
    return ''
  }

  // Mobile swipe detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || !isSubpage) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y

    // Only trigger if horizontal swipe is dominant and long enough
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0 && prevPage) navigate(prevPage)
      if (dx < 0 && nextPage) navigate(nextPage)
    }
    touchStart.current = null
  }, [isSubpage, prevPage, nextPage, navigate])

  return (
    <div
      className="min-h-screen bg-bg-darkest"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-[60]"
      />

      <Navbar />
      <main className="relative">
        <Outlet />

        {/* Desktop page arrows */}
        {prevPage && (
          <button
            onClick={() => navigate(prevPage)}
            className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 items-center gap-1 pl-2 pr-3 py-3 bg-bg-card/80 backdrop-blur-sm border border-border rounded-xl text-text-muted hover:text-accent hover:border-accent/50 transition-all group"
            aria-label={`Go to ${pageLabel(prevPage)}`}
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium">{pageLabel(prevPage)}</span>
          </button>
        )}
        {nextPage && (
          <button
            onClick={() => navigate(nextPage)}
            className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 items-center gap-1 pl-3 pr-2 py-3 bg-bg-card/80 backdrop-blur-sm border border-border rounded-xl text-text-muted hover:text-accent hover:border-accent/50 transition-all group"
            aria-label={`Go to ${pageLabel(nextPage)}`}
          >
            <span className="text-xs font-medium">{pageLabel(nextPage)}</span>
            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Back to top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-40 p-3 bg-bg-card/80 backdrop-blur-sm border border-border rounded-xl text-text-muted hover:text-accent hover:border-accent/50 transition-all"
              aria-label="Back to top"
            >
              <ChevronUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
