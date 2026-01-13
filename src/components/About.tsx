import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-text-primary">About Me</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
          </div>
          <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
            <p>
              I'm a <span className="text-accent font-medium">Master's student in Business Information Systems</span> at 
              FHNW, currently working as a Support Hero at <a href="https://twio.tech" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">twio.tech</a> in Zürich. 
              Based in the Basel Metropolregion, Switzerland.
            </p>
            <p>
              I love building things that live at the intersection of <span className="text-accent">technology</span> and 
              <span className="text-accent"> user experience</span>. When I'm not coding, you'll find me exploring 
              streets with my Fujifilm, capturing the raw beauty of urban landscapes and travel moments.
            </p>
            <p>
              Driven by curiosity and a love for <span className="text-text-primary">clean, functional design</span>. 
              Whether it's gamifying education, recommending the perfect game, or crafting pixel-perfect interfaces — 
              I'm always up for a challenge.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
