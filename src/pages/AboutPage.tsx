import { useEffect } from 'react'
import About from '../components/About'
import Travel from '../components/Travel'
import Contact from '../components/Contact'
import PageTransition from '../components/ui/PageTransition'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About | Jan Wilhelm'
  }, [])

  return (
    <PageTransition>
      <About />
      <Travel />
      <Contact />
    </PageTransition>
  )
}
