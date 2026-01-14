import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check localStorage on mount, default to dark
    const stored = localStorage.getItem('theme')
    if (stored === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])

  const toggle = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-lg bg-bg-card border border-border hover:border-accent transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={18} className="text-accent" />
      ) : (
        <Moon size={18} className="text-accent" />
      )}
    </motion.button>
  )
}
