import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderGit2, Wrench, Clock } from 'lucide-react'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import PageTransition from '../components/ui/PageTransition'

const jumpLinks = [
  { label: 'Projects', href: '#projects', icon: FolderGit2 },
  { label: 'Tech Stack', href: '#skills', icon: Wrench },
  { label: 'Timeline', href: '#timeline', icon: Clock },
]

export default function WorkPage() {
  const [activeSection, setActiveSection] = useState('#projects')

  useEffect(() => {
    document.title = 'CV & Projects | Jan Wilhelm'
  }, [])

  // Track which section is in view
  useEffect(() => {
    const ids = ['projects', 'skills', 'timeline']
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <PageTransition>
      {/* Jump links */}
      <div className="sticky top-16 z-30 bg-bg-darkest/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-center gap-3 overflow-x-auto">
          {jumpLinks.map((link, i) => {
            const isActive = activeSection === link.href
            return (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-accent/10 border-accent/50 text-accent'
                    : 'bg-bg-card border-border text-text-secondary hover:text-accent hover:border-accent/50'
                }`}
              >
                <link.icon size={14} />
                {link.label}
              </motion.a>
            )
          })}
        </div>
      </div>
      <Projects />
      <Skills />
    </PageTransition>
  )
}
