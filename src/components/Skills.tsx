import { motion } from 'framer-motion'
import { Briefcase, GraduationCap } from 'lucide-react'

const techStack = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Spring Boot', 'Python', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Git', 'Figma']

const timeline = [
  { year: '2025', title: 'Support Hero @ twio.tech', type: 'work', current: true },
  { year: '2024-2027', title: 'MSc Business Information Systems @ FHNW', type: 'edu', current: true },
  { year: '2024', title: 'Zivildienst WBZ', type: 'work', current: false },
  { year: '2019-2022', title: 'BSc Business Information Technology @ FHNW', type: 'edu', current: false },
  { year: '2020', title: 'Exchange @ Erhvervsakademiet Aarhus', type: 'edu', current: false },
  { year: '2018-2019', title: 'Lehrerassistent @ HPS Liestal', type: 'work', current: false },
]

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Skills & Experience</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-semibold text-accent mb-6">Tech Stack</h3>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech, i) => (
                <motion.span key={tech} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, y: -2 }} className="px-4 py-2 bg-bg-card border border-accent/30 rounded-lg text-text-primary hover:border-accent hover:bg-accent/10 hover:text-accent transition-all cursor-default">
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-semibold text-accent mb-6">Timeline</h3>
            <div className="space-y-4 relative">
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent via-accent/30 to-transparent" />
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4 items-start pl-6 relative">
                  <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 ${item.current ? 'bg-accent border-accent' : item.type === 'work' ? 'bg-bg-darkest border-accent' : 'bg-bg-darkest border-text-muted'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'work' ? <Briefcase size={14} className="text-accent" /> : <GraduationCap size={14} className="text-text-muted" />}
                      <span className={`text-sm font-mono ${item.current ? 'text-accent' : 'text-text-muted'}`}>{item.year}</span>
                      {item.current && <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">Current</span>}
                    </div>
                    <span className="text-text-secondary">{item.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
