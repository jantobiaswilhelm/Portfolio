import { useEffect, useRef, useState } from 'react'

interface Options {
  typeMs?: number
  deleteMs?: number
  holdMs?: number
}

export function useTypewriter(words: string[], opts: Options = {}): string {
  const { typeMs = 85, deleteMs = 40, holdMs = 1500 } = opts
  const [text, setText] = useState('')
  const state = useRef({ wordIndex: 0, charCount: 0, deleting: false })

  useEffect(() => {
    if (words.length === 0) return
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const s = state.current
      const word = words[s.wordIndex]

      if (!s.deleting && s.charCount < word.length) {
        s.charCount++
        setText(word.slice(0, s.charCount))
        timer = setTimeout(tick, typeMs)
      } else if (!s.deleting && s.charCount === word.length) {
        s.deleting = true
        timer = setTimeout(tick, holdMs)
      } else if (s.deleting && s.charCount > 0) {
        s.charCount--
        setText(word.slice(0, s.charCount))
        timer = setTimeout(tick, deleteMs)
      } else {
        s.deleting = false
        s.wordIndex = (s.wordIndex + 1) % words.length
        timer = setTimeout(tick, typeMs)
      }
    }

    timer = setTimeout(tick, typeMs)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join('|'), typeMs, deleteMs, holdMs])

  return text
}
