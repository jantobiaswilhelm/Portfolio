import { useState, useEffect } from 'react'

export function useTypewriter(words: string[], typingSpeed = 80, deletingSpeed = 50, pauseMs = 2000) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentWord.length) {
          setText(currentWord.slice(0, text.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseMs)
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1))
        } else {
          setIsDeleting(false)
          setWordIndex((i) => (i + 1) % words.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs])

  return text
}
