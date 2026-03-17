import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'CV & Projects', to: '/work' },
  { label: 'Photography', to: '/photography' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg-darkest/95 backdrop-blur-md border-b border-accent/20' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-accent hover:text-accent-hover transition-colors" style={{ fontFamily: 'var(--font-family-heading)' }}>
          JW<span className="text-text-primary">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}
              >
                {link.label}
                {isActive && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </Link>
            )
          })}
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-bg-darkest/95 backdrop-blur-md border-b border-accent/20"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-accent bg-accent/10' : 'text-text-secondary hover:text-accent hover:bg-bg-card/50'}`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
