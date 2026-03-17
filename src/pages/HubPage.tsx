import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Camera, User, MapPin, Code, Gamepad2, GraduationCap } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import PreviewCard from '../components/ui/PreviewCard'
import PageTransition from '../components/ui/PageTransition'
import { projects } from '../data/projects'
import { techStack } from '../data/skills'
import photosData from '../data/photos.json'

const roles = ['Developer', 'Photographer', 'MSc Student', 'Gamer']

export default function HubPage() {
  const text = useTypewriter(roles)

  useEffect(() => {
    document.title = 'Jan Wilhelm'
  }, [])

  const featured = projects.find(p => p.featured) || projects[0]
  const second = projects.find(p => p.title === 'SQL Scrolls Public Release') || projects[2]
  const topTech = techStack.slice(0, 8)
  const firstPhotos = photosData.slice(0, 4)

  return (
    <PageTransition>
      <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 bg-bg-darkest">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
        </div>

        <div className="text-center px-6 relative z-10 w-full max-w-5xl mx-auto">
          {/* Profile photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-accent/50 shadow-lg shadow-accent/20">
              <img
                src={`${import.meta.env.BASE_URL}images/profile.png`}
                alt="Jan Wilhelm"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </motion.div>

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 h-7 flex justify-center items-center"
          >
            <span className="text-accent font-medium tracking-widest uppercase text-sm font-mono">
              [ {text}<span className="animate-pulse">|</span> ]
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-text-primary mb-4"
          >
            Jan <span className="text-accent">Wilhelm</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-16"
          >
            Building digital experiences & capturing moments
          </motion.p>

          {/* Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* About Card */}
            <PreviewCard title="About" icon={User} to="/about" delay={0.5}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={`${import.meta.env.BASE_URL}images/profile.png`}
                    alt="Jan Wilhelm"
                    className="w-12 h-12 rounded-full object-cover border border-accent/30 flex-shrink-0"
                  />
                  <p className="text-text-secondary text-sm leading-relaxed">
                    What started as talking about innovations quickly turned into "why don't I just build this myself."
                  </p>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <MapPin size={14} className="text-accent" />
                  Basel, Switzerland
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Code size={12} className="text-accent" />Full-Stack
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Camera size={12} className="text-accent" />Fujifilm
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted text-xs">
                    <Gamepad2 size={12} className="text-accent" />Gamer
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-bg-hover/80 border border-border/50 rounded-md text-xs text-text-secondary">
                    <img src="https://flagcdn.com/w20/de.png" alt="DE" className="w-4 h-3 rounded-sm object-cover" />German
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-bg-hover/80 border border-border/50 rounded-md text-xs text-text-secondary">
                    <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-3 rounded-sm object-cover" />English
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-bg-hover/80 border border-border/50 rounded-md text-xs text-text-secondary">
                    <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-4 h-3 rounded-sm object-cover" />French
                  </span>
                </div>
              </div>
            </PreviewCard>

            {/* CV & Projects Card */}
            <PreviewCard title="CV & Projects" icon={Briefcase} to="/work" delay={0.6}>
              <div className="space-y-3">
                {/* Mini timeline - current roles */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <Briefcase size={12} className="text-accent flex-shrink-0" />
                    <span className="text-text-primary text-xs">Support Hero @ twio.tech</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <GraduationCap size={12} className="text-accent flex-shrink-0" />
                    <span className="text-text-primary text-xs">MSc Business IS @ FHNW</span>
                  </div>
                </div>
                {/* Featured projects */}
                <div className="space-y-1.5">
                  <div className="bg-bg-hover/50 rounded-lg p-2.5 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-text-primary font-medium text-xs">{featured.title}</p>
                      <p className="text-text-muted text-[11px]">{featured.tagline}</p>
                    </div>
                    <span className="text-[10px] text-accent font-mono">{featured.year}</span>
                  </div>
                  {second && (
                    <div className="bg-bg-hover/50 rounded-lg p-2.5 border border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-text-primary font-medium text-xs">{second.title}</p>
                        <p className="text-text-muted text-[11px]">{second.tagline}</p>
                      </div>
                      <span className="text-[10px] text-accent font-mono">{second.year}</span>
                    </div>
                  )}
                </div>
                <p className="text-text-muted text-xs">{projects.length} projects &middot; {projects.filter(p => p.current).length} active</p>
                <div className="flex flex-wrap gap-1.5">
                  {topTech.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full border border-accent/20">{t}</span>
                  ))}
                </div>
              </div>
            </PreviewCard>

            {/* Photography Card */}
            <PreviewCard title="Photography" icon={Camera} to="/photography" delay={0.7}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-1.5 rounded-lg overflow-hidden">
                  {firstPhotos.map((photo, i) => (
                    <div key={i} className="aspect-square overflow-hidden">
                      <img
                        src={`${import.meta.env.BASE_URL}${photo.src.slice(1)}`}
                        alt={photo.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-text-muted text-xs">{photosData.length} frames on Fujifilm</p>
              </div>
            </PreviewCard>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
