import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import photosData from '../data/photos.json'

type Photo = { src: string; category: string; alt: string }
const photos: Photo[] = photosData.map(p => ({ ...p, src: `${import.meta.env.BASE_URL}${p.src.slice(1)}` }))

export default function Photography() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  const next = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null)

  return (
    <section id="photography" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Film className="text-accent" />Photography
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </motion.div>
        <p className="text-text-secondary mb-12">
          Street photography, landscapes, and travel moments — captured on <span className="text-accent">Fujifilm</span>.
          <span className="text-text-muted ml-2 text-sm font-mono">{photos.length} frames</span>
        </p>

        {/* Photo grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              onClick={() => openLightbox(index)}
              className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative border border-border hover:border-accent/40 transition-colors"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-darkest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Frame number */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-bg-darkest/70 backdrop-blur-sm rounded-md text-accent font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Click hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-accent" />
                <span className="text-text-primary text-sm">View</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-darkest/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-text-secondary hover:text-accent transition-colors">
              <X size={32} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-6 text-text-secondary hover:text-accent transition-colors">
              <ChevronLeft size={40} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-6 text-text-secondary hover:text-accent transition-colors">
              <ChevronRight size={40} />
            </button>
            <motion.img
              key={photos[lightbox].src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-secondary text-sm">
              Frame <span className="text-accent font-mono">{String(lightbox + 1).padStart(2, '0')}</span> of {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
