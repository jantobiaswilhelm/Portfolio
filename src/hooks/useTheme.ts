import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Initial check
    setIsDark(!document.documentElement.classList.contains('light'))

    // Watch for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(!document.documentElement.classList.contains('light'))
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  return { isDark }
}
