import { motion } from 'framer-motion'
import { ExternalLink, Github, Sparkles, FileText, BookOpen, Play } from 'lucide-react'

const projects = [
  {
    title: 'Lutem',
    tagline: '"Headspace meets Steam"',
    year: '2025',
    current: true,
    description: 'AI-powered gaming recommendation platform that matches your mood to the perfect game. Built as part of my Master\'s coursework with startup potential.',
    stack: ['React', 'TypeScript', 'Spring Boot', 'Firebase', 'PostgreSQL', 'Tailwind'],
    live: 'https://lutemweb.netlify.app',
    github: 'https://github.com/jantobiaswilhelm/LutemPrototype',
    document: 'docs/lutem-project.pdf',
    highlights: ['Multi-dimensional recommendation engine', 'Steam library integration', '4 themes × 2 modes design system'],
    featured: true,
  },
  {
    title: 'FHNW SQL Scrolls',
    tagline: 'Gamified SQL learning',
    year: '2023',
    current: false,
    description: 'Contributed to this gamified SQL learning platform during my Bachelor thesis. My focus: documentation, Docker deployment, content additions, UI refinement, and bugfixing.',
    stack: ['JavaScript', 'Node.js', 'MongoDB', 'Python ML', 'Docker'],
    github: 'https://github.com/fhnw-sql/FHNW-SQLScrolls',
    publication: 'https://irf.fhnw.ch/entities/publication/f7aa9072-b6f5-4cfb-b0dc-a43211171f50',
    intro: 'https://studierendenprojekte.wirtschaft.fhnw.ch/view/2699',
    highlights: ['AI-based task recommendation', 'Used in FHNW teaching', 'Full Docker deployment'],
    featured: false,
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-bg-card/30">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Featured Projects</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </motion.div>
        <div className="grid gap-8">
          {projects.map((project, index) => (
            <motion.div key={project.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="relative bg-bg-card border border-border rounded-xl p-8 hover:border-accent/70 transition-all duration-300 group">
              <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-accent via-accent/50 to-transparent rounded-full" />
              {project.featured && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-accent text-bg-darkest text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles size={12} />FEATURED
                </div>
              )}
              <div className="pl-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">{project.title}</h3>
                      <span className="text-sm font-mono text-text-muted">{project.year}</span>
                      {project.current && <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">Active</span>}
                    </div>
                    <p className="text-accent italic">{project.tagline}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all text-sm">
                        <ExternalLink size={14} />Live
                      </a>
                    )}
                    {project.intro && (
                      <a href={project.intro} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all text-sm">
                        <Play size={14} />Intro
                      </a>
                    )}
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-all text-sm">
                      <Github size={14} />Code
                    </a>
                    {project.publication && (
                      <a href={project.publication} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-all text-sm">
                        <BookOpen size={14} />Paper
                      </a>
                    )}
                    {project.document && (
                      <a href={`${import.meta.env.BASE_URL}${project.document}`} download className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-all text-sm">
                        <FileText size={14} />PDF
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-text-secondary mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.stack.map((tech) => (
                    <span key={tech} className="px-3 py-1 text-sm bg-accent/10 text-accent rounded-full border border-accent/20">{tech}</span>
                  ))}
                </div>
                <ul className="text-text-muted text-sm space-y-1">
                  {project.highlights.map((h) => (<li key={h} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent rounded-full" />{h}</li>))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
