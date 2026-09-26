import { useEffect } from 'react'
import { SmoothScrollProvider } from './lib/smooth-scroll'
import { Grain } from './components/layout/Grain'
import { Loader } from './components/layout/Loader'
import { Cursor } from './components/layout/Cursor'
import { Nav } from './components/layout/Nav'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Projects } from './components/sections/Projects'
import { Experience } from './components/sections/Experience'
import { Photography } from './components/sections/Photography'
import { Contact } from './components/sections/Contact'
import { photos } from './data/photos-manifest'

export default function App() {
  useEffect(() => {
    document.title = 'Jan Wilhelm — Developer & Photographer'
  }, [])

  return (
    <SmoothScrollProvider>
      <Grain />
      <Loader frames={photos.length} />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Photography />
        <Contact />
      </main>
      <Footer />
    </SmoothScrollProvider>
  )
}
