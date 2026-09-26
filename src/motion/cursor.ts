import { animate, EASE_OUT } from './env'

/**
 * Shared state of the camera cursor (rendered by components/layout/Cursor).
 * The hero drives the AF point through this: it reads the lagging ring
 * position to decide when focus has "locked", and sets hunting/locked.
 */

export type CursorMode = '' | 'default' | 'link' | 'dot' | 'photo' | 'af'

export const cursor = {
  /** tight dot position */
  dx: 0,
  dy: 0,
  /** lagging ring position — the AF point */
  rx: 0,
  ry: 0,
  seen: false,
  /** mode currently shown */
  mode: '' as CursorMode,
  /** mode under the pointer, before gating */
  hover: '' as CursorMode,
  /** the hero allows AF mode only while it's (almost) un-scrolled */
  afAllowed: false,
}

let root: HTMLElement | null = null
let afBox: HTMLElement | null = null
let afLbl: HTMLElement | null = null

export function bindCursor(els: { root: HTMLElement | null; afBox: HTMLElement | null; afLbl: HTMLElement | null }) {
  root = els.root
  afBox = els.afBox
  afLbl = els.afLbl
}

export function setAfState(state: 'hunting' | 'locked' | null, label?: string) {
  root?.classList.toggle('hunting', state === 'hunting')
  root?.classList.toggle('locked', state === 'locked')
  if (label && afLbl) afLbl.textContent = label
}

/** the little "caught it" pop when focus locks */
export function pulseAf() {
  animate(afBox, [{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 200, easing: EASE_OUT })
}
