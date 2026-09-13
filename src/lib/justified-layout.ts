export interface LayoutTile {
  /** Index into the original aspects array. */
  index: number
  width: number
  height: number
}

export interface LayoutRow {
  height: number
  tiles: LayoutTile[]
}

/**
 * Lays photos out in rows that fill the container width exactly, preserving
 * every aspect ratio. The final row is never stretched: it keeps the target
 * height unless the row would overflow, in which case it scales down to fit.
 *
 * Pure, DOM-free and dependency-free so it can be unit tested directly.
 */
export function layoutRows(
  aspects: number[],
  containerWidth: number,
  targetHeight: number,
  gutter: number,
): LayoutRow[] {
  if (aspects.length === 0 || containerWidth <= 0 || targetHeight <= 0) return []

  const build = (indices: number[], aspectSum: number, justify: boolean): LayoutRow => {
    const available = containerWidth - gutter * (indices.length - 1)
    const fitted = available / aspectSum
    const height = justify ? fitted : Math.min(targetHeight, fitted)
    return {
      height,
      tiles: indices.map((index) => ({
        index,
        width: height * aspects[index],
        height,
      })),
    }
  }

  const rows: LayoutRow[] = []
  let current: number[] = []
  let aspectSum = 0

  for (let i = 0; i < aspects.length; i++) {
    current.push(i)
    aspectSum += aspects[i]
    const naturalWidth = targetHeight * aspectSum + gutter * (current.length - 1)
    if (naturalWidth >= containerWidth) {
      rows.push(build(current, aspectSum, true))
      current = []
      aspectSum = 0
    }
  }

  if (current.length > 0) rows.push(build(current, aspectSum, false))

  return rows
}
