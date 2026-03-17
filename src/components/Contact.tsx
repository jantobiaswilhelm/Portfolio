import { motion } from 'framer-motion'
import { MapPin, Send } from 'lucide-react'
import { socials } from '../data/contact'

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-bold text-text-primary mb-4">Let's <span className="text-accent">Connect</span></h2>
          <p className="text-text-secondary mb-2">Got a project in mind? Let's talk.</p>
          <p className="text-text-muted mb-8 flex items-center justify-center gap-2 text-sm">
            <MapPin size={16} className="text-accent" />Basel Metropolregion, Switzerland
          </p>
          <motion.a href="mailto:jan.tobias.wilhelm@gmail.com" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-darkest font-bold rounded-xl hover:bg-accent-hover transition-colors mb-8">
            <Send size={20} />Say Hello
          </motion.a>
          <div className="flex justify-center gap-4 mb-16 flex-wrap">
            {socials.map((social) => (
              <motion.a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center w-12 h-12 bg-bg-card border border-accent/30 rounded-xl text-accent hover:bg-accent hover:text-bg-darkest transition-all" title={social.label}>
                <social.icon size={22} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
