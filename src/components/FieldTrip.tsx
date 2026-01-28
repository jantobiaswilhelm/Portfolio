import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'

const photos = [
  { src: 'images/china/1758839736299.jpg', alt: 'Shenzhen Bay field trip' },
  { src: 'images/china/1758839736822.jpg', alt: 'Shenzhen Bay field trip' },
  { src: 'images/china/1758839739208.jpg', alt: 'Shenzhen Bay field trip' },
  { src: 'images/china/1758839744350.jpg', alt: 'Shenzhen Bay field trip' },
].map(p => ({ ...p, src: `${import.meta.env.BASE_URL}${p.src}` }))

export default function FieldTrip() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const closeLightbox = () => setLightbox(null)
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % photos.length : null), [])

  useEffect(() => {
    if (lightbox === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, prev, next])

  return (
    <section id="fieldtrip" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-8"
        >
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <MapPin className="text-accent" />Shenzhen Bay Field Trip
          </h2>
          <span className="px-3 py-1 text-xs font-mono bg-accent/20 text-accent rounded-full">2025</span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-4 text-text-secondary mb-10 max-w-3xl"
        >
          <p>
            As part of my MSc in Business Information Systems at FHNW, I had the opportunity to join a two-week field trip to China's Greater Bay Area — my first time in Mainland China. A huge thanks to the organizers who made this experience possible.
          </p>
          <p>
            We visited companies like <span className="text-accent">Huawei</span>, <span className="text-accent">Tencent</span>, <span className="text-accent">Sika</span>, and <span className="text-accent">Pony.ai</span> across Guangzhou, Dongguan, and Shenzhen. Beyond the professional visits, the trip was about bonding with Swiss and Chinese students, exploring Cantonese cuisine, and navigating language barriers with WeChat and translation apps.
          </p>
          <p>
            It was the perfect mix of professional insights, cultural exchange, and personal growth — an experience I'll carry with me for a long time.
          </p>
        </motion.div>

        {/* Blog CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <a
            href="https://lnkd.in/eNeCfqG6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all text-sm font-medium"
          >
            <ExternalLink size={14} />Read the full blog
          </a>
        </motion.div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setLightbox(index)}
              className="aspect-[3/2] rounded-lg overflow-hidden cursor-pointer group relative border border-border"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-darkest/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
              <span className="text-accent font-mono">{lightbox + 1}</span> / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
