import { useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function MagneticButton({ href, children }: { href: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduced = usePrefersReducedMotion()

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${
      (e.clientY - r.top - r.height / 2) * 0.4
    }px)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <a
      ref={ref}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="inline-flex items-center gap-2 px-7 py-4 border border-border rounded-full text-ts font-head text-sm transition-colors hover:text-accent hover:border-accent will-change-transform"
    >
      {children}
    </a>
  )
}
