import { motion } from 'framer-motion'
import { MapPin, Camera, Code, Gamepad2 } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold text-text-primary">About Me</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
          </div>
          
          <div className="grid md:grid-cols-5 gap-10 items-start">
            {/* Photo */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="md:col-span-2">
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border-2 border-border hover:border-accent/50 transition-colors">
                  <img src={`${import.meta.env.BASE_URL}images/profile2.jpg`} alt="Jan Wilhelm" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}images/profile.png`; e.currentTarget.classList.add('object-top') }} />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-bg-card border border-border rounded-xl p-3 flex items-center gap-2">
                  <MapPin size={16} className="text-accent" />
                  <span className="text-text-secondary text-sm">Basel, Switzerland 🇨🇭</span>
                </div>
              </div>
            </motion.div>

            {/* Text content */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="md:col-span-3 space-y-6">
              <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
                <p>
                  <span className="text-accent font-medium">Master's student</span> in Business Information Systems at FHNW, 
                  Support Hero at <a href="https://twio.tech" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">twio.tech</a>. 
                  Passionate about bridging the gap between business and tech.
                </p>
                <p>
                  What started as talking about business innovations quickly turned into <span className="text-accent">"why don't I just build this myself."</span> Turns out I like making things more than planning them. Especially when it solves my own problems.
                </p>
                <p>
                  Outside of code, I shoot street photography on my <span className="text-accent">Fujifilm</span> and game way too much.
                </p>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-bg-card border border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors">
                  <Code size={20} className="mx-auto mb-2 text-accent" />
                  <span className="text-text-muted text-sm">Full-Stack</span>
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors">
                  <Camera size={20} className="mx-auto mb-2 text-accent" />
                  <span className="text-text-muted text-sm">Fujifilm</span>
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-4 text-center hover:border-accent/50 transition-colors">
                  <Gamepad2 size={20} className="mx-auto mb-2 text-accent" />
                  <span className="text-text-muted text-sm">Gamer</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
