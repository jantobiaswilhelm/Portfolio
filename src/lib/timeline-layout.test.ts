import { describe, it, expect } from 'vitest'
import {
  Y0,
  Y1,
  nowYear,
  spansOf,
  layLanes,
  xOf,
  playheadYear,
  detailTarget,
  barFill,
  scrubProgress,
  yy,
  type Span,
} from './timeline-layout'
import { timeline, type TimelineItem } from '../data/timeline'

const NOW = 2026 + 8 / 12 // September 2026
const idx = (title: string) => timeline.findIndex((t) => t.title === title)

describe('nowYear', () => {
  it('is the year plus elapsed months as a fraction', () => {
    expect(nowYear(new Date(2026, 8, 26))).toBeCloseTo(2026 + 8 / 12)
    expect(nowYear(new Date(2020, 0, 1))).toBe(2020)
  })
})

describe('spansOf', () => {
  const spans = spansOf(timeline, NOW)

  it('keeps one span per entry, in data order', () => {
    expect(spans).toHaveLength(8)
    expect(spans.map((s) => s.i)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('starts twio.tech mid-2025 and runs it to now', () => {
    const twio = spans[idx('Support Hero')]
    expect(twio.s).toBe(2025.5)
    expect(twio.e).toBe(NOW)
    expect(twio.plan).toBeNull()
  })

  it('places WBZ between the BSc and the MSc', () => {
    const wbz = spans[idx('Civil Service')]
    expect(wbz.s).toBe(2023)
    expect(wbz.e).toBe(2024)
    expect(spans[idx('BSc Business Information Technology')].e).toBeLessThanOrEqual(wbz.s)
    expect(spans[idx('MSc Business Information Systems')].s).toBeGreaterThanOrEqual(wbz.e)
  })

  it('gives an ongoing entry with a later planned end a dashed tail', () => {
    const msc = spans[idx('MSc Business Information Systems')]
    expect(msc.e).toBe(NOW)
    expect(msc.plan).toBe(2027)
  })

  it('drops the tail once the planned end has passed', () => {
    const msc = spansOf(timeline, 2027.5)[idx('MSc Business Information Systems')]
    expect(msc.plan).toBeNull()
  })
})

describe('layLanes', () => {
  const spans = spansOf(timeline, NOW)

  it('fits all work on one lane — nothing overlaps', () => {
    const { lanes, count } = layLanes(spans, 'work')
    expect(count).toBe(1)
    for (const s of spans.filter((x) => x.item.type === 'work')) expect(lanes.get(s.i)).toBe(0)
  })

  it('stacks the Aarhus exchange under the BSc it overlaps', () => {
    const { lanes, count } = layLanes(spans, 'edu')
    expect(count).toBe(2)
    expect(lanes.get(idx('Exchange Semester'))).toBe(1)
    expect(lanes.get(idx('BSc Business Information Technology'))).toBe(0)
    expect(lanes.get(idx('MSc Business Information Systems'))).toBe(0)
    expect(lanes.get(idx('WMS (Federal VET Diploma)'))).toBe(0)
  })

  it('reserves a planned tail so nothing lands on top of it', () => {
    const items: TimelineItem[] = [
      { year: '', from: 2024, to: null, planned: 2027, title: 'A', org: '', short: 'A', type: 'edu', current: true },
      { year: '', from: 2026.8, to: 2026.9, title: 'B', org: '', short: 'B', type: 'edu', current: false },
    ]
    const { lanes } = layLanes(spansOf(items, 2026.7), 'edu')
    expect(lanes.get(1)).toBe(1)
  })

  it('still reports one lane for a type with no entries', () => {
    expect(layLanes([], 'work').count).toBe(1)
  })
})

describe('xOf', () => {
  it('maps the axis range onto 0..1', () => {
    expect(xOf(Y0)).toBe(0)
    expect(xOf(Y1)).toBe(1)
    expect(xOf((Y0 + Y1) / 2)).toBeCloseTo(0.5)
  })
})

describe('playheadYear', () => {
  it('starts at the first year', () => {
    expect(playheadYear(0, Y0, NOW)).toBe(Y0)
  })
  it('eases through the middle', () => {
    expect(playheadYear(0.425, Y0, NOW)).toBeCloseTo(Y0 + (NOW - Y0) / 2)
  })
  it('reaches now at 85% of the scrub and holds there', () => {
    expect(playheadYear(0.85, Y0, NOW)).toBeCloseTo(NOW)
    expect(playheadYear(1, Y0, NOW)).toBeCloseTo(NOW)
  })
})

describe('detailTarget', () => {
  const spans = spansOf(timeline, NOW)

  it('shows whatever is hovered or focused', () => {
    expect(detailTarget(spans, Y0, 4)).toBe(4)
  })
  it('otherwise shows the latest entry the playhead has started', () => {
    expect(detailTarget(spans, Y0, null)).toBe(idx('WMS (Federal VET Diploma)'))
    expect(detailTarget(spans, 2020.5, null)).toBe(idx('Exchange Semester'))
    expect(detailTarget(spans, 2023.5, null)).toBe(idx('Civil Service'))
    expect(detailTarget(spans, 2024.2, null)).toBe(idx('MSc Business Information Systems'))
    expect(detailTarget(spans, NOW, null)).toBe(idx('Support Hero'))
  })
  it('falls back to the oldest entry before anything has started', () => {
    expect(detailTarget(spans, 2010, null)).toBe(spans.length - 1)
  })
  it('prefers a current entry when two start together', () => {
    const tie: Span[] = [
      { item: { ...timeline[3], current: false }, i: 0, s: 2020, e: 2022, plan: null },
      { item: { ...timeline[1], current: true }, i: 1, s: 2020, e: 2022, plan: null },
    ]
    expect(detailTarget(tie, 2021, null)).toBe(1)
  })
})

describe('barFill', () => {
  const span: Span = { item: timeline[3], i: 3, s: 2019, e: 2023, plan: null }
  it('is empty before the bar, full after it, proportional inside', () => {
    expect(barFill(span, 2018)).toBe(0)
    expect(barFill(span, 2021)).toBe(0.5)
    expect(barFill(span, 2024)).toBe(1)
  })
})

describe('scrubProgress', () => {
  const spans = spansOf(timeline, NOW)
  it('lands the playhead just inside the clicked entry', () => {
    const bsc = spans[idx('BSc Business Information Technology')]
    const p = scrubProgress(bsc, Y0, NOW)
    expect(playheadYear(p, Y0, NOW)).toBeGreaterThan(bsc.s)
    expect(playheadYear(p, Y0, NOW)).toBeLessThan(bsc.e)
  })
  it('never asks for more than the 85% where the playhead reaches now', () => {
    for (const s of spans) expect(scrubProgress(s, Y0, NOW)).toBeLessThanOrEqual(0.85)
  })
})

describe('yy', () => {
  it('formats a year like a film-camera date imprint', () => {
    expect(yy(2026.7)).toBe("'26")
    expect(yy(2014)).toBe("'14")
  })
})
