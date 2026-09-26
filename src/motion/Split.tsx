import type { CSSProperties } from 'react'

/** Letters that are animated (everything except whitespace). */
// eslint-disable-next-line react-refresh/only-export-components
export const splitCount = (text: string) => text.replace(/\s+/g, '').length

/**
 * Wrap each character in a mask so it can rise into place (`.w > .ch > .chi`),
 * exactly like the prototype's split(). `start` continues the stagger index
 * when one heading is made of several Splits; put the readable text in an
 * aria-label on the parent — the letters are aria-hidden.
 */
export function Split({ text, start = 0 }: { text: string; start?: number }) {
  const parts = text.split(/(\s+)/).filter(Boolean)
  const offsets = parts.map((_, k) => start + splitCount(parts.slice(0, k).join('')))
  return (
    <>
      {parts.map((part, k) =>
        /^\s+$/.test(part) ? (
          ' '
        ) : (
          <span key={k} className="w" aria-hidden="true">
            {[...part].map((c, j) => (
              <span key={j} className="ch">
                <span className="chi" style={{ '--i': offsets[k] + j } as CSSProperties}>{c}</span>
              </span>
            ))}
          </span>
        ),
      )}
    </>
  )
}
