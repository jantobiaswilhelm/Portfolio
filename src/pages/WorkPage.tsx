import { useEffect } from 'react'
import Projects from '../components/Projects'
import Skills from '../components/Skills'
import PageTransition from '../components/ui/PageTransition'

export default function WorkPage() {
  useEffect(() => {
    document.title = 'CV & Projects | Jan Wilhelm'
  }, [])

  return (
    <PageTransition>
      <Projects />
      <Skills />
    </PageTransition>
  )
}
