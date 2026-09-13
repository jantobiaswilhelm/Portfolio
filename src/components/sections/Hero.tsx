import { Reveal } from '../ui/Reveal'
import { StatCounter } from '../ui/StatCounter'
import { useTypewriter } from '../../hooks/useTypewriter'
import { roles } from '../../data/about'
import { stats } from '../../data/stats'
import { findPhoto, heroId, largestWidth, photoSrcSet, photoUrl } from '../../data/photos-manifest'

const BASE = import.meta.env.BASE_URL

export function Hero() {
  const role = useTypewriter(roles)
  const hero = findPhoto(heroId)

  return (
    <section id="hero" className="min-h-[100dvh] flex flex-col justify-center relative overflow-hidden">
      {/* full-bleed darkened photo background; falls back to the gradient alone */}
      <div className="absolute inset-0 z-0">
        {hero && (
          <picture>
            <source srcSet={photoSrcSet(hero, 'avif')} sizes="100vw" type="image/avif" />
            <source srcSet={photoSrcSet(hero, 'webp')} sizes="100vw" type="image/webp" />
            <img
              src={photoUrl(hero.id, largestWidth(hero), 'jpg')}
              srcSet={photoSrcSet(hero, 'jpg')}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              className="w-full h-full object-cover opacity-30 contrast-105 scale-105"
            />
          </picture>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg,rgba(8,8,10,.55) 0%,rgba(8,8,10,.55) 45%,var(--color-bg) 100%),radial-gradient(70% 60% at 30% 40%,transparent,rgba(8,8,10,.35))',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-8 w-full">
        <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-16 items-center">
          <div>
            <Reveal className="font-head text-accent tracking-[0.3em] uppercase text-xs mb-7 flex items-center gap-3.5 before:content-[''] before:w-11 before:h-px before:bg-accent">
              Basel, Switzerland
            </Reveal>
            <Reveal>
              <h1 className="text-[clamp(56px,12vw,150px)] tracking-[-0.04em] mb-2">
                Jan<br />Wilhelm<span className="text-accent">.</span>
              </h1>
            </Reveal>
            <Reveal>
              <div className="text-[clamp(20px,3.4vw,34px)] font-head font-medium text-ts mb-10 h-[1.2em]">
                I'm a <span className="text-accent">{role}</span>
                <span className="animate-pulse">|</span>
              </div>
            </Reveal>
            <Reveal>
              <p className="max-w-[520px] text-ts text-[17px] mb-11">
                Full-stack developer, Fujifilm photographer and MSc student. I build digital
                products where design, engineering and people meet — and capture the moments in
                between.
              </p>
            </Reveal>
            <Reveal>
              <div className="flex gap-12 flex-wrap">
                <StatCounter value={stats.projects} label="Projects" />
                <StatCounter value={stats.active} label="Active now" />
                <StatCounter value={stats.frames} label="Frames" />
              </div>
            </Reveal>
          </div>

          <Reveal className="relative aspect-[4/5] rounded-[22px] overflow-hidden border border-border shadow-[0_34px_90px_rgba(0,0,0,0.55)] max-w-[300px] md:max-w-none order-first md:order-none">
            <img
              src={`${BASE}images/profile.png`}
              alt="Jan Wilhelm"
              className="w-full h-full object-cover grayscale contrast-105 scale-[1.02] transition-[filter] duration-700 hover:grayscale-0"
            />
          </Reveal>
        </div>
      </div>
      {/* scroll cue */}
      <div className="absolute bottom-10 left-8 z-10 flex flex-col items-start gap-1.5" aria-hidden="true">
        <span className="font-head text-tm uppercase tracking-[0.25em] text-xs">Scroll</span>
        <div className="w-px h-10 overflow-hidden">
          <div className="w-full h-full bg-tm animate-[sweep_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  )
}
