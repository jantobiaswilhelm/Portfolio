import type { TimelineItem } from '../data/timeline'
import { clamp, easeInOut, lerp, pad2 } from '../motion/env'

/**
 * Pure layout for the Experience "exposure timeline": where each bar sits on
 * the year axis, which lane it takes, where the playhead is for a given scroll
 * progress, and which entry the detail card shows.
 */

/** First year on the axis. */
export const Y0 = 2014
/** Last year on the axis — a little air after the MSc's planned end. */
export const Y1 = 2027.6
/** Share of the scrub over which the playhead travels to "now"; the rest holds there. */
export const SWEEP = 0.85

export interface Span {
  item: TimelineItem
  /** index in the timeline data */
  i: number
  /** start, in fractional years */
  s: number
  /** end; ongoing entries end at "now" */
  e: number
  /** planned end beyond now (drawn as a dashed tail), else null */
  plan: number | null
}

/** The current moment as a fractional year (September 2026 → 2026.67). */
export const nowYear = (date: Date) => date.getFullYear() + date.getMonth() / 12

export function spansOf(items: TimelineItem[], now: number): Span[] {
  return items.map((item, i) => ({
    item,
    i,
    s: item.from,
    e: item.to ?? now,
    plan: item.planned !== undefined && item.planned > now ? item.planned : null,
  }))
}

/**
 * Greedy lanes for one track: earliest start first, each span takes the first
 * lane whose last occupant has ended (a planned tail counts as occupied).
 * Returns span index → lane, and how many lanes the track needs (at least one).
 */
export function layLanes(spans: Span[], type: TimelineItem['type']) {
  const ends: number[] = []
  const lanes = new Map<number, number>()
  spans
    .filter((x) => x.item.type === type)
    .sort((a, b) => a.s - b.s)
    .forEach((x) => {
      let lane = ends.findIndex((end) => end <= x.s)
      if (lane < 0) { lane = ends.length; ends.push(0) }
      ends[lane] = x.plan ?? x.e
      lanes.set(x.i, lane)
    })
  return { lanes, count: Math.max(1, ends.length) }
}

/** Position of a year on the axis, 0..1. */
export const xOf = (year: number, y0 = Y0, y1 = Y1) => (year - y0) / (y1 - y0)

/** Playhead year for scrub progress p: eases from y0 to now over SWEEP, then holds. */
export const playheadYear = (p: number, y0: number, now: number) =>
  lerp(y0, now, easeInOut(clamp(p / SWEEP)))

/**
 * Which entry the detail card shows: the hovered/focused one; otherwise the
 * latest entry the playhead has started (a current one wins a tie); before
 * anything has started, the oldest entry (last in the data).
 */
export function detailTarget(spans: Span[], ph: number, hover: number | null): number {
  if (hover !== null) return hover
  let best: Span | null = null
  for (const x of spans) {
    if (x.s > ph + 0.001) continue
    if (!best || x.s > best.s || (x.s === best.s && x.item.current && !best.item.current)) best = x
  }
  return (best ?? spans[spans.length - 1]).i
}

/** How much of a bar the playhead has exposed, 0..1. */
export const barFill = (span: Span, ph: number) => clamp((ph - span.s) / (span.e - span.s))

/**
 * Scrub progress that parks the playhead just inside an entry (0.6 years in,
 * or its end if shorter) — where clicking a bar scrolls to.
 */
export function scrubProgress(span: Span, y0: number, now: number): number {
  const target = Math.min(span.s + 0.6, span.e)
  const k = clamp((target - y0) / (now - y0))
  // invert the ease so the playhead actually lands on `target`
  return invertEaseInOut(k) * SWEEP
}

function invertEaseInOut(y: number): number {
  if (y <= 0) return 0
  if (y >= 1) return 1
  return y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt((1 - y) * 2) / 2
}

/** Film-camera date-back style: 2026.7 → '26 */
export const yy = (y: number) => `'${pad2(Math.floor(y) % 100)}`
