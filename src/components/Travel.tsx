import { useState } from 'react'
import { motion } from 'framer-motion'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Plane, MapPin } from 'lucide-react'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Map uses geo.properties.name - we need to match those exact names
const visitedCountries: Record<string, { name: string; year: string; isHome?: boolean }> = {
  'Monaco': { name: 'Monaco', year: '2017' },
  'France': { name: 'France', year: 'Multiple' },
  'Germany': { name: 'Germany', year: 'Multiple' },
  'Iceland': { name: 'Iceland', year: '2018' },
  'United States of America': { name: 'USA', year: '2019' },
  'Thailand': { name: 'Thailand', year: '2019' },
  'Singapore': { name: 'Singapore', year: '2019' },
  'Italy': { name: 'Italy', year: '2020' },
  'Netherlands': { name: 'Netherlands', year: '2020' },
  'Denmark': { name: 'Denmark', year: '2020' },
  'Sweden': { name: 'Sweden', year: '2021' },
  'Costa Rica': { name: 'Costa Rica', year: '2024' },
  'Poland': { name: 'Poland', year: '2025' },
  'Czechia': { name: 'Czech Republic', year: '2025' },
  'Portugal': { name: 'Portugal', year: '2024' },
  'China': { name: 'China', year: '2025' },
  'Austria': { name: 'Austria', year: '2021' },
  'Croatia': { name: 'Croatia', year: '2017' },
  'Belgium': { name: 'Belgium', year: '2020' },
  'United Kingdom': { name: 'UK', year: '2016, 2017' },
  'Norway': { name: 'Norway', year: '2011' },
  'Finland': { name: 'Finland', year: '2013' },
  'Tunisia': { name: 'Tunisia', year: '2014' },
  'Hungary': { name: 'Hungary', year: '2019' },
  'Greece': { name: 'Greece', year: '2014' },
  'Spain': { name: 'Spain', year: '2016' },
  'Switzerland': { name: 'Switzerland', year: 'Home', isHome: true },
}

// For the sidebar list
const tripsList = [
  { name: 'Monaco', year: '2017' },
  { name: 'France', year: 'Multiple' },
  { name: 'Germany', year: 'Multiple' },
  { name: 'Iceland', year: '2018' },
  { name: 'USA', year: '2019' },
  { name: 'Thailand', year: '2019' },
  { name: 'Singapore', year: '2019' },
  { name: 'Hong Kong', year: '2019' },
  { name: 'Italy', year: '2020' },
  { name: 'Netherlands', year: '2020' },
  { name: 'Denmark', year: '2020' },
  { name: 'Sweden', year: '2021' },
  { name: 'Costa Rica', year: '2024' },
  { name: 'Poland', year: '2025' },
  { name: 'Czech Republic', year: '2025' },
  { name: 'Portugal', year: '2024' },
  { name: 'China', year: '2025' },
  { name: 'Austria', year: '2021' },
  { name: 'Croatia', year: '2017' },
  { name: 'Belgium', year: '2020' },
  { name: 'UK', year: '2016, 2017' },
  { name: 'Norway', year: '2011' },
  { name: 'Finland', year: '2013' },
  { name: 'Tunisia', year: '2014' },
  { name: 'Hungary', year: '2019' },
  { name: 'Greece', year: '2014' },
  { name: 'Spain', year: '2016' },
]

const countryCount = tripsList.length + 1 // +1 for Switzerland (home)

export default function Travel() {
  const [tooltip, setTooltip] = useState<{ name: string; year: string } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (geo: any, evt: React.MouseEvent) => {
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
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const geoName = geo.properties.name
                      const countryData = visitedCountries[geoName]
                      const isVisited = !!countryData
                      const isHome = countryData?.isHome
                      
                      const getFill = () => {
                        if (isHome) return '#ef4444' // red for home
                        if (isVisited) return '#d4a853' // amber for visited
                        return '#1a1a1a' // dark for unvisited
                      }
                      const getHoverFill = () => {
                        if (isHome) return '#f87171' // lighter red
                        if (isVisited) return '#e5b964' // lighter amber
                        return '#252525'
                      }
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            default: {
                              fill: getFill(),
                              stroke: '#333',
                              strokeWidth: 0.5,
                              outline: 'none',
                            },
                            hover: {
                              fill: getHoverFill(),
                              stroke: '#444',
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
      </div>
    </section>
  )
}
