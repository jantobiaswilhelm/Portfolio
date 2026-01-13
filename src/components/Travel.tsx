import { useState } from 'react'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Plane, MapPin } from 'lucide-react'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const visitedCountries = [
  { code: 'MCO', name: 'Monaco', year: '2017' },
  { code: 'FRA', name: 'France', year: 'Multiple' },
  { code: 'DEU', name: 'Germany', year: 'Multiple' },
  { code: 'ISL', name: 'Iceland', year: '2018' },
  { code: 'USA', name: 'USA', year: '2019' },
  { code: 'THA', name: 'Thailand', year: '2019' },
  { code: 'SGP', name: 'Singapore', year: '2019' },
  { code: 'HKG', name: 'Hong Kong', year: '2019' },
  { code: 'ITA', name: 'Italy', year: '2020' },
  { code: 'NLD', name: 'Netherlands', year: '2020' },
  { code: 'DNK', name: 'Denmark', year: '2020' },
  { code: 'SWE', name: 'Sweden', year: '2021' },
  { code: 'CRI', name: 'Costa Rica', year: '2024' },
  { code: 'POL', name: 'Poland', year: '2025' },
  { code: 'CZE', name: 'Czech Republic', year: '2025' },
  { code: 'PRT', name: 'Portugal', year: '2024' },
  { code: 'CHN', name: 'China', year: '2025' },
  { code: 'AUT', name: 'Austria', year: '2021' },
  { code: 'HRV', name: 'Croatia', year: '2017' },
  { code: 'BEL', name: 'Belgium', year: '2020' },
  { code: 'GBR', name: 'UK', year: '2016, 2017' },
  { code: 'NOR', name: 'Norway', year: '2011' },
  { code: 'FIN', name: 'Finland', year: '2013' },
  { code: 'TUN', name: 'Tunisia', year: '2014' },
  { code: 'HUN', name: 'Hungary', year: '2019' },
  { code: 'CHE', name: 'Switzerland', year: 'Home' },
]

const visitedCodes = visitedCountries.map(c => c.code)

export default function Travel() {
  const [tooltip, setTooltip] = useState<{ name: string; year: string } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (geo: any, evt: React.MouseEvent) => {
    const country = visitedCountries.find(c => c.code === geo.id)
    if (country) {
      setTooltip({ name: country.name, year: country.year })
      setTooltipPos({ x: evt.clientX, y: evt.clientY })
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  const sortedByYear = [...visitedCountries]
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
          <span className="text-accent font-bold text-2xl">{visitedCountries.length}</span> countries explored and counting.
        </p>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Map */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-3 bg-bg-card border border-border rounded-xl overflow-hidden relative">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 120, center: [10, 45] }}
              style={{ width: '100%', height: '500px' }}
            >
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const isVisited = visitedCodes.includes(geo.id)
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            default: {
                              fill: isVisited ? '#d4a853' : '#1a1a1a',
                              stroke: '#333',
                              strokeWidth: 0.5,
                              outline: 'none',
                            },
                            hover: {
                              fill: isVisited ? '#e5b964' : '#252525',
                              stroke: '#444',
                              strokeWidth: 0.5,
                              outline: 'none',
                              cursor: isVisited ? 'pointer' : 'default',
                            },
                            pressed: {
                              fill: isVisited ? '#d4a853' : '#1a1a1a',
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
                key={country.code} 
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
      </div>
    </section>
  )
}
