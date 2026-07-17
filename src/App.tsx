import { useEffect } from 'react'
import { SmoothScrollProvider } from './lib/smooth-scroll'
import { Nav } from './components/layout/Nav'
import { ProgressDots } from './components/layout/ProgressDots'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Work } from './components/sections/Work'
import { Photography } from './components/sections/Photography'
import { Travel } from './components/sections/Travel'
import { Contact } from './components/sections/Contact'

export default function App() {
  useEffect(() => {
    document.title = 'Jan Wilhelm — Developer & Photographer'
  }, [])

  return (
    <SmoothScrollProvider>
      {/* fixed ambient background */}
      <div
        className="fixed inset-0 -z-10 animate-[hue_18s_ease-in-out_infinite_alternate]"
        style={{
          background:
            'radial-gradient(60% 50% at 70% 20%,rgba(212,168,83,.10),transparent 60%),radial-gradient(50% 40% at 20% 80%,rgba(120,90,200,.07),transparent 60%),var(--color-bg)',
        }}
      />
      <Nav />
      <ProgressDots />
      <main>
        <Hero />
        <About />
        <Work />
        <Photography />
        <Travel />
        <Contact />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
