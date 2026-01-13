import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Photography from './components/Photography'
import Contact from './components/Contact'

function App() {
  return (
    <div className="min-h-screen bg-bg-darkest">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Photography />
        <Contact />
      </main>
    </div>
  )
}

export default App
