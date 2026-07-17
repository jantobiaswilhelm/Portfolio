import { useEffect, useState } from 'react'

export interface SectionTop {
  id: string
  top: number
}

export function activeFromPositions(tops: SectionTop[], threshold: number): string {
  let active = tops.length ? tops[0].id : ''
  for (const t of tops) {
    if (t.top <= threshold) active = t.id
  }
  return active
}

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.4
      const tops: SectionTop[] = ids.map((id) => {
        const el = document.getElementById(id)
        return { id, top: el ? el.getBoundingClientRect().top : Infinity }
      })
      setActive(activeFromPositions(tops, threshold))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])

  return active
}
