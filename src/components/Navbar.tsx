import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Travel', href: '#travel' },
  { label: 'Photography', href: '#photography' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = navLinks.map(link => link.href.slice(1))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element && window.scrollY >= element.offsetTop - 200) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg-darkest/95 backdrop-blur-md border-b border-accent/20' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-accent hover:text-accent-hover transition-colors">JW<span className="text-text-primary">.</span></a>
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1)
            return (
              <a key={link.href} href={link.href} className={`relative text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}>
                {link.label}
                {isActive && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </a>
            )
          })}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
