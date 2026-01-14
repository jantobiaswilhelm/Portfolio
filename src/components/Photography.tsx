import { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Camera, X, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import photosData from '../data/photos.json'

type Photo = { src: string; category: string; alt: string }
const photos: Photo[] = photosData.map(p => ({ ...p, src: `${import.meta.env.BASE_URL}${p.src.slice(1)}` }))

// Film sprocket hole component
const SprocketHoles = ({ count = 20 }: { count?: number }) => (
  <div className="flex justify-between px-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="w-3 h-4 bg-bg-darkest rounded-sm" />
    ))}
  </div>
)

export default function Photography() {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Horizontal scroll based on vertical scroll progress
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-60%"])

  const openLightbox = (index: number) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  const next = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null)

  return (
    <section id="photography" className="py-24 overflow-hidden" ref={containerRef}>
      <div className="max-w-6xl mx-auto px-6 mb-12">
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
        <p className="text-text-secondary">
          Street photography, landscapes, and travel moments — captured on <span className="text-accent">Fujifilm</span>.
        </p>
      </div>

      {/* Film strip container */}
      <div className="relative py-8">
        {/* Film strip background */}
        <div className="absolute inset-0 bg-bg-card/80 border-y border-border" />
        
        {/* Top sprocket holes */}
        <div className="relative z-10 mb-2 opacity-40">
          <SprocketHoles count={30} />
        </div>

        {/* Scrolling photos */}
        <motion.div 
          style={{ x }} 
          className="flex gap-6 px-12 py-4 relative z-10"
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="flex-shrink-0 w-80 aspect-[3/2] bg-bg-hover rounded-lg overflow-hidden cursor-pointer group relative border-4 border-bg-darkest shadow-xl"
            >
              <img 
                src={photo.src} 
                alt={photo.alt} 
                loading="lazy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-darkest/90 via-bg-darkest/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Frame number */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-bg-darkest/80 rounded text-accent font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              {/* Click hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-accent" />
                <span className="text-text-primary text-sm">View</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom sprocket holes */}
        <div className="relative z-10 mt-2 opacity-40">
          <SprocketHoles count={30} />
        </div>
      </div>

      {/* Scroll hint */}
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-text-muted text-sm mt-8"
      >
        <span className="text-accent">↕</span> Scroll to explore the roll
      </motion.p>

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
