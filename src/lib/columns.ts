/**
 * Column layout for the photo wall: photos go into N columns, each into the
 * currently shortest one, and every column drifts at its own parallax speed so
 * they slide against each other while you scroll.
 */

/** 2 columns on phones, stepping up to 5 on wide screens. */
export function columnCount(width: number): number {
  if (width < 600) return 2
  if (width < 1000) return 3
  if (width < 1400) return 4
  return 5
}

/**
 * Parallax speed per column, as a fraction of the section's half-height moved
 * across the scroll through it. Alternating signs make neighbours counter-slide.
 */
export const COLUMN_SPEEDS: Record<number, number[]> = {
  2: [-0.06, 0.06],
  3: [-0.08, 0.07, -0.1],
  4: [-0.08, 0.06, -0.12, 0.03],
  5: [-0.08, 0.06, -0.12, 0.04, -0.05],
}

export interface Placed<T> {
  item: T
  index: number
}

/**
 * Put each item into the shortest column so far, where an item's height is
 * 1/aspect (all columns share a width). Reading order is kept inside a column.
 * Degenerate aspect ratios count as square rather than breaking the layout.
 */
export function distribute<T>(items: T[], n: number, aspectOf: (item: T) => number): Placed<T>[][] {
  const cols: Placed<T>[][] = Array.from({ length: n }, () => [])
  const heights = new Array<number>(n).fill(0)
  items.forEach((item, index) => {
    const k = heights.indexOf(Math.min(...heights))
    cols[k].push({ item, index })
    const ar = aspectOf(item)
    heights[k] += Number.isFinite(ar) && ar > 0 ? 1 / ar : 1
  })
  return cols
}
