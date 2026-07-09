import { Reveal } from '../ui/Reveal'
import { MagneticButton } from '../ui/MagneticButton'
import { socials } from '../../data/socials'

export function Contact() {
  return (
    <section id="contact" className="py-40 max-w-[1180px] mx-auto px-8 text-center">
      <Reveal>
        <span className="font-head text-accent text-sm font-medium">05</span>
      </Reveal>
      <Reveal>
        <h2 className="text-[clamp(44px,9vw,120px)] tracking-[-0.04em] my-6">
          Let's build<br />something<span className="text-accent">.</span>
        </h2>
      </Reveal>
      <Reveal>
        <p className="text-ts max-w-[460px] mx-auto mb-11 text-[17px]">
          Open to collaborations, freelance work and good conversations.
        </p>
      </Reveal>
      <Reveal className="flex justify-center gap-4 flex-wrap">
        {socials.map((s) => (
          <MagneticButton key={s.label} href={s.href}>
            <s.icon size={16} />
            {s.label}
          </MagneticButton>
        ))}
      </Reveal>
    </section>
  )
}
