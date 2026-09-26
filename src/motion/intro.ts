/**
 * Hand-off between the loader and the hero. The loader waits for the hero
 * image to decode (the hero calls markHeroReady), then opens and "starts" the
 * hero by putting `hero-in` on <html> — CSS keys the develop-in off that class,
 * and components that need JS at that moment use onHeroIn.
 */

export const HERO_IN_EVENT = 'jw:hero-in'

let resolveReady: () => void = () => {}
export const heroReady: Promise<void> = new Promise((r) => { resolveReady = r })
export const markHeroReady = () => resolveReady()

export const isHeroIn = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('hero-in')

export function startHero() {
  document.documentElement.classList.add('hero-in')
  dispatchEvent(new Event(HERO_IN_EVENT))
}

/** Run `fn` when the hero starts (immediately if it already has). Returns a cleanup. */
export function onHeroIn(fn: () => void): () => void {
  if (isHeroIn()) { fn(); return () => {} }
  const h = () => fn()
  addEventListener(HERO_IN_EVENT, h, { once: true })
  return () => removeEventListener(HERO_IN_EVENT, h)
}
