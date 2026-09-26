/** Shared motion constants and small maths, same values as the prototype. */

const mq = (q: string) => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(q).matches

/** prefers-reduced-motion, read once at load (the prototype does the same). */
export const RM = mq('(prefers-reduced-motion: reduce)')
/** A real hovering, precise pointer — gates cursor effects and hover motion. */
export const FINE = mq('(hover: hover) and (pointer: fine)')

export const EASE_OUT = 'cubic-bezier(0.23,1,0.32,1)'
export const EASE_MOVE = 'cubic-bezier(0.77,0,0.175,1)'

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * WAAPI's `finished` never settles in a hidden tab (and jsdom has no WAAPI at
 * all), so UI state must never hang on it: race it against a timeout.
 */
export function settled(anim: Animation | undefined, ms: number): Promise<void> {
  if (!anim) return Promise.resolve()
  return Promise.race([
    anim.finished.then(() => {}, () => {}),
    new Promise<void>((r) => setTimeout(r, ms + 60)),
  ])
}

/** element.animate when available (not in jsdom), else nothing. */
export function animate(el: Element | null | undefined, frames: Keyframe[], opts: KeyframeAnimationOptions): Animation | undefined {
  if (!el || typeof (el as HTMLElement).animate !== 'function') return undefined
  return (el as HTMLElement).animate(frames, opts)
}
