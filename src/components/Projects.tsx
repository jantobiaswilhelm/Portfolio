import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Sparkles, FileText, BookOpen, Play, Image, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { projects, type Preview } from '../data/projects'

export default function Projects() {
  const [previewModal, setPreviewModal] = useState<{ previews: Preview[]; index: number } | null>(null)

  const openPreview = (previews: Preview[]) => {
    if (previews.length > 0) {
      setPreviewModal({ previews, index: 0 })
    }
  }
  const closePreview = () => setPreviewModal(null)
  const prevImage = useCallback(() => setPreviewModal(p => p ? { ...p, index: (p.index - 1 + p.previews.length) % p.previews.length } : null), [])
  const nextImage = useCallback(() => setPreviewModal(p => p ? { ...p, index: (p.index + 1) % p.previews.length } : null), [])

  useEffect(() => {
    if (!previewModal) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [previewModal, prevImage, nextImage])

  return (
    <section id="projects" className="py-24 px-6 bg-bg-card/30 scroll-mt-28">
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
                    {/* Preview button - only show if previews exist */}
                    {project.previews && project.previews.length > 0 && (
                      <button 
                        onClick={() => openPreview(project.previews)}
                        className="flex items-center gap-2 px-3 py-2 bg-accent text-bg-darkest rounded-lg hover:bg-accent-hover transition-all text-sm font-medium"
                      >
                        <Image size={14} />Preview
                      </button>
                    )}
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
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-text-secondary hover:border-accent hover:text-accent transition-all text-sm">
                        <Github size={14} />Code
                      </a>
                    )}
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

      {/* Preview Modal */}
      <AnimatePresence>
        {previewModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-bg-darkest/95 backdrop-blur-sm flex items-center justify-center p-6" 
            onClick={closePreview}
          >
            <button onClick={closePreview} className="absolute top-6 right-6 text-text-secondary hover:text-accent transition-colors z-10">
              <X size={32} />
            </button>
            
            {previewModal.previews.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-6 text-text-secondary hover:text-accent transition-colors z-10">
                  <ChevronLeft size={40} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-6 text-text-secondary hover:text-accent transition-colors z-10">
                  <ChevronRight size={40} />
                </button>
              </>
            )}

            <motion.div 
              key={previewModal.index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl">
                <img 
                  src={`${import.meta.env.BASE_URL}${previewModal.previews[previewModal.index].src}`}
                  alt={previewModal.previews[previewModal.index].caption}
                  className="w-full h-auto max-h-[75vh] object-contain bg-bg-card"
                  onError={(e) => {
                    e.currentTarget.src = ''
                    e.currentTarget.alt = 'Screenshot not found'
                    e.currentTarget.className = 'w-full h-64 flex items-center justify-center bg-bg-card text-text-muted'
                  }}
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-text-primary">{previewModal.previews[previewModal.index].caption}</p>
                {previewModal.previews.length > 1 && (
                  <p className="text-text-muted text-sm mt-1">
                    {previewModal.index + 1} / {previewModal.previews.length}
                  </p>
                )}
              </div>

              {/* Thumbnail strip */}
              {previewModal.previews.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {previewModal.previews.map((preview, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewModal(p => p ? { ...p, index: i } : null)}
                      className={`w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                        i === previewModal.index ? 'border-accent' : 'border-border opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={`${import.meta.env.BASE_URL}${preview.src}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
