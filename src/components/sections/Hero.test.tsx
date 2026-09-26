import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Hero } from './Hero'

beforeEach(() => {
  localStorage.clear()
})

describe('Hero', () => {
  it('is the #hero section', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('section#hero')).not.toBeNull()
  })

  it('names Jan in a readable h1 even though the letters are split for animation', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: 'Jan Wilhelm.' })).toBeInTheDocument()
  })

  it('shows the Oeschinensee portrait print with real alt text and Jan’s own crop', () => {
    render(<Hero />)
    const img = screen.getByAltText('Jan Wilhelm sitting on a rock at Oeschinensee') as HTMLImageElement
    expect(img.getAttribute('src')).toContain('images/portrait-oeschinensee.jpg')
    const webp = img.parentElement?.querySelector('source[type="image/webp"]')
    expect(webp?.getAttribute('srcset')).toContain('portrait-oeschinensee.webp')
  })

  it('loads the background from generated derivatives, never an original', () => {
    const { container } = render(<Hero />)
    const bg = container.querySelector('img.hero-img') as HTMLImageElement
    expect(bg).not.toBeNull()
    expect(bg.getAttribute('srcset')).toMatch(/-800\.jpg 800w/)
    expect(bg.getAttribute('src')).toMatch(/images\/photos\/.+-\d+\.jpg$/)
    expect(bg.getAttribute('sizes')).toBe('100vw')
    // the blurred focus plane is a small derivative too
    const soft = container.querySelector('img.hero-soft') as HTMLImageElement
    expect(soft.getAttribute('src')).toMatch(/-(800|1200|1600)\.webp$/)
  })

  it('offers the AF cursor over the pinned stage and marks what can be focused', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('.hero-pin')).toHaveAttribute('data-cursor', 'af')
    expect(container.querySelectorAll('.near').length).toBeGreaterThanOrEqual(3)
  })

  it('the hint toggles camera sound, which is off until asked for', () => {
    const { container } = render(<Hero />)
    const btn = container.querySelector('.snd-inline') as HTMLButtonElement
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn).toHaveTextContent('Turn on sound')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveTextContent('Sound on')
    expect(localStorage.getItem('jw-sound')).toBe('1')
  })

  it('starts the role rotator on the first role', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('.role-word')).toHaveTextContent('Developer')
  })
})
