import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Plane, MapPin, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { visitedCountries, tripsList, countryCount, fieldTripPhotos } from '../data/travel'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const chinaPhotos = fieldTripPhotos.map(p => ({ ...p, src: `${import.meta.env.BASE_URL}${p.src}` }))

export default function Travel() {
  const [tooltip, setTooltip] = useState<{ name: string; year: string } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { isDark } = useTheme()

  const closeLightbox = () => setLightbox(null)
  const prevPhoto = useCallback(() => setLightbox(i => i !== null ? (i - 1 + chinaPhotos.length) % chinaPhotos.length : null), [])
  const nextPhoto = useCallback(() => setLightbox(i => i !== null ? (i + 1) % chinaPhotos.length : null), [])

  useEffect(() => {
    if (lightbox === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, prevPhoto, nextPhoto])

  // Theme-aware colors
  const colors = {
    unvisited: isDark ? '#1a1a1a' : '#e8e4dc',
    unvisitedHover: isDark ? '#252525' : '#ddd8ce',
    stroke: isDark ? '#333' : '#ccc',
    strokeHover: isDark ? '#444' : '#bbb',
  }

  const handleMouseEnter = (geo: any, evt: any) => {
    const geoName = geo.properties.name
    const country = visitedCountries[geoName]
    if (country) {
      setTooltip({ name: country.name, year: country.year })
      setTooltipPos({ x: evt.clientX, y: evt.clientY })
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  const sortedByYear = [...tripsList]
    .filter(c => c.year !== 'Home' && c.year !== 'Multiple')
    .sort((a, b) => {
      const yearA = parseInt(a.year.split(',')[0]) || 0
      const yearB = parseInt(b.year.split(',')[0]) || 0
      return yearB - yearA
    })

  return (
    <section id="travel" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Plane className="text-accent" />Travel
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </motion.div>
        
        <p className="text-text-secondary mb-8">
          <span className="text-accent font-bold text-2xl">{countryCount}</span> countries explored and counting.
        </p>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Map */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-3 bg-bg-card border border-border rounded-xl overflow-hidden relative">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 120, center: [10, 45] }}
              style={{ width: '100%', height: '500px' }}
            >
              <ZoomableGroup
                center={[10, 45]}
                minZoom={1}
                maxZoom={5}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => {
                      const geoName = geo.properties.name
                      const countryData = visitedCountries[geoName]
                      const isVisited = !!countryData
                      const isHome = countryData?.isHome
                      
                      const getFill = () => {
                        if (isHome) return '#ef4444' // red for home
                        if (isVisited) return isDark ? '#d4a853' : '#b8942e' // amber for visited
                        return colors.unvisited
                      }
                      const getHoverFill = () => {
                        if (isHome) return '#f87171' // lighter red
                        if (isVisited) return isDark ? '#e5b964' : '#c9a23a' // lighter amber
                        return colors.unvisitedHover
                      }
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={(evt: any) => handleMouseEnter(geo, evt)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            default: {
                              fill: getFill(),
                              stroke: colors.stroke,
                              strokeWidth: 0.5,
                              outline: 'none',
                            },
                            hover: {
                              fill: getHoverFill(),
                              stroke: colors.strokeHover,
                              strokeWidth: 0.5,
                              outline: 'none',
                              cursor: isVisited ? 'pointer' : 'default',
                            },
                            pressed: {
                              fill: getFill(),
                              outline: 'none',
                            },
                          }}
                        />
                      )
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            
            {/* Tooltip */}
            {tooltip && (
              <div 
                className="fixed z-50 px-3 py-2 bg-bg-darkest border border-accent rounded-lg shadow-lg pointer-events-none"
                style={{ left: tooltipPos.x + 10, top: tooltipPos.y - 40 }}
              >
                <span className="text-accent font-medium">{tooltip.name}</span>
                <span className="text-text-muted text-sm ml-2">{tooltip.year}</span>
              </div>
            )}
          </motion.div>

          {/* Legend */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            <h3 className="text-accent font-semibold mb-4 flex items-center gap-2 sticky top-0 bg-bg-darkest py-2">
              <MapPin size={16} /> Recent Trips
            </h3>
            {sortedByYear.map((country, i) => (
              <motion.div 
                key={country.name} 
                initial={{ opacity: 0, x: 10 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.03 }}
                className="flex justify-between items-center p-2 bg-bg-card/50 border border-border/50 rounded-lg hover:border-accent/30 transition-colors"
              >
                <span className="text-text-primary text-sm">{country.name}</span>
                <span className="text-accent text-xs font-mono">{country.year}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Notable Trips — China Field Trip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <MapPin className="text-accent" />Highlights
            </h3>
            <span className="px-3 py-1 text-xs font-mono bg-accent/20 text-accent rounded-full">2025</span>
            <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6 md:p-8">
            <h4 className="text-xl font-semibold text-accent mb-4">Shenzhen Bay Field Trip</h4>
            <div className="space-y-4 text-text-secondary mb-6 max-w-3xl">
              <p>
                As part of my MSc in Business Information Systems at FHNW, I joined a two-week field trip to China's Greater Bay Area.
                We visited companies like <span className="text-accent">Huawei</span>, <span className="text-accent">Tencent</span>, <span className="text-accent">Sika</span>, and <span className="text-accent">Pony.ai</span> across Guangzhou, Dongguan, and Shenzhen.
              </p>
              <p>
                Beyond the professional visits, the trip was about bonding with Swiss and Chinese students, exploring Cantonese cuisine, and navigating language barriers with WeChat and translation apps.
              </p>
            </div>

            <a
              href="https://lnkd.in/eNeCfqG6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all text-sm font-medium mb-6"
            >
              <ExternalLink size={14} />Read the full blog
            </a>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {chinaPhotos.map((photo, index) => (
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
        </motion.div>
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
            <button onClick={(e) => { e.stopPropagation(); prevPhoto() }} className="absolute left-6 text-text-secondary hover:text-accent transition-colors">
              <ChevronLeft size={40} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextPhoto() }} className="absolute right-6 text-text-secondary hover:text-accent transition-colors">
              <ChevronRight size={40} />
            </button>
            <motion.img
              key={chinaPhotos[lightbox].src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={chinaPhotos[lightbox].src}
              alt={chinaPhotos[lightbox].alt}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-text-secondary text-sm">
              <span className="text-accent font-mono">{lightbox + 1}</span> / {chinaPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
