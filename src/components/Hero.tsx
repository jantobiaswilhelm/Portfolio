import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink, Sparkles } from 'lucide-react'

const roles = ['Developer', 'Photographer', 'MSc Student', 'Gamer']

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-bg-darkest">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center px-6 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-6">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-accent/50 shadow-lg shadow-accent/20">
            <img src={`${import.meta.env.BASE_URL}images/profile.png`} alt="Jan Wilhelm" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
        </motion.div>
        
        {/* Animated role */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-4 h-7 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span key={roleIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }} className="text-accent font-medium tracking-widest uppercase text-sm block">
              {roles[roleIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6">Jan <span className="text-accent">Wilhelm</span></h1>
        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-8">Building digital experiences & capturing moments</p>
        
        {/* Quick stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center gap-6 mb-10 text-sm">
          <div className="text-text-muted"><span className="text-accent font-bold">2</span> Projects</div>
          <div className="text-text-muted">•</div>
          <div className="text-text-muted"><span className="text-accent font-bold">15+</span> Photos</div>
          <div className="text-text-muted">•</div>
          <div className="text-text-muted"><span className="text-accent font-bold">MSc</span> Student</div>
        </motion.div>

        {/* Featured project preview */}
        <motion.a href="#projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="inline-block mb-10 group">
          <div className="bg-bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-accent/50 transition-all max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={16} className="text-accent" />
              <span className="text-xs text-accent font-medium uppercase tracking-wide">Currently Building</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-text-primary font-semibold group-hover:text-accent transition-colors">Lutem</h3>
                <p className="text-text-muted text-sm">AI-powered gaming recommendations</p>
              </div>
              <ExternalLink size={18} className="text-text-muted group-hover:text-accent transition-colors" />
            </div>
          </div>
        </motion.a>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-4 justify-center">
          <a href="#projects" className="px-6 py-3 bg-accent text-bg-darkest font-semibold rounded-lg hover:bg-accent-hover transition-colors">View Projects</a>
          <a href="#contact" className="px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors">Get in Touch</a>
        </motion.div>
      </motion.div>
      <motion.a href="#about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }} className="absolute bottom-8 text-accent/70 hover:text-accent transition-colors">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ChevronDown size={32} /></motion.div>
      </motion.a>
    </section>
  )
}
