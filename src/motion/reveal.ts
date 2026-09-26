/**
 * Scroll reveals, like the prototype: one shared IntersectionObserver adds `.in`
 * once an element enters; CSS (`[data-reveal]`, `.in .chi`, …) does the motion.
 * Use as a callback ref: `<div data-reveal ref={reveal}>`.
 */

let io: IntersectionObserver | null = null

function observer(): IntersectionObserver | null {
  if (io) return io
  if (typeof IntersectionObserver === 'undefined') return null
  io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('in')
      io?.unobserve(e.target)
      e.target.dispatchEvent(new Event('reveal'))
    }),
    { rootMargin: '0px 0px -10% 0px' },
  )
  return io
}

export function reveal(el: Element | null): void | (() => void) {
  if (!el) return
  const o = observer()
  if (!o) { el.classList.add('in'); return }
  o.observe(el)
  return () => o.unobserve(el)
}
