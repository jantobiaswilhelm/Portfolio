import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'
import photosData from '../data/photos.json'

type Photo = { src: string; category: string; alt: string }
const photos: Photo[] = photosData

const categories = ['all', ...Array.from(new Set(photos.map(p => p.category)))]

export default function Photography() {
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState<number | null>(null)
  
  const filtered = filter === 'all' ? photos : photos.filter(p => p.category === filter)
  
  const openLightbox = (index: number) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null)
  const next = () => setLightbox(i => i !== null ? (i + 1) % filtered.length : null)

  return (
    <section id="photography" className="py-24 px-6 bg-bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Camera className="text-accent" />Photography
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </motion.div>
        <p className="text-text-secondary mb-8">Street photography, landscapes, and travel moments — captured with <span className="text-accent">Fujifilm</span>.</p>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === cat ? 'bg-accent text-bg-darkest' : 'bg-bg-card border border-border text-text-secondary hover:border-accent hover:text-accent'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Photo grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((photo, index) => (
              <motion.div key={photo.src} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} onClick={() => openLightbox(index)} className="aspect-[4/3] bg-bg-hover border border-border rounded-xl overflow-hidden group cursor-pointer relative">
                <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                <div className="hidden w-full h-full flex-col items-center justify-center text-text-muted absolute inset-0 bg-bg-hover">
                  <Camera size={32} className="opacity-30 mb-2" />
                  <span className="text-xs opacity-50">Image not found</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-darkest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1 bg-accent text-bg-darkest text-xs font-bold rounded-full capitalize">{photo.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {photos.length === 0 && (
          <p className="text-center text-text-muted mt-8 text-sm border border-dashed border-accent/30 rounded-lg py-8">
            📸 Add photos to <code className="text-accent">src/data/photos.json</code>
          </p>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-bg-darkest/95 backdrop-blur-sm flex items-center justify-center" onClick={closeLightbox}>
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-text-secondary hover:text-accent transition-colors"><X size={32} /></button>
            <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-6 text-text-secondary hover:text-accent transition-colors"><ChevronLeft size={40} /></button>
            <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-6 text-text-secondary hover:text-accent transition-colors"><ChevronRight size={40} /></button>
            <motion.img key={filtered[lightbox].src} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} src={filtered[lightbox].src} alt={filtered[lightbox].alt} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-secondary text-sm">{filtered[lightbox].alt} <span className="text-accent ml-2">({lightbox + 1}/{filtered.length})</span></div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
