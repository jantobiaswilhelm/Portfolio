import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { About } from './About'
import { bio, facts, techStack } from '../../data/about'

describe('About', () => {
  it('is headed "About"', () => {
    render(<About />)
    expect(screen.getByRole('heading', { level: 2, name: 'About' })).toBeInTheDocument()
  })

  it('renders the whole statement, word by word, with the quote in accent', () => {
    const { container } = render(<About />)
    const statement = container.querySelector('.statement')!
    expect(statement.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'What started as talking about innovations quickly turned into "why don\'t I just build this myself."',
    )
    const accented = [...statement.querySelectorAll('.sw.accent')].map((w) => w.textContent).join(' ')
    expect(accented).toBe('"why don\'t I just build this myself."')
  })

  it('renders the bio, every fact and the portrait', () => {
    render(<About />)
    expect(screen.getByText(bio)).toBeInTheDocument()
    for (const f of facts) {
      expect(screen.getByText(f.k)).toBeInTheDocument()
      expect(screen.getByText(f.v)).toBeInTheDocument()
    }
    expect(screen.getByAltText('Jan Wilhelm')).toHaveAttribute('src', expect.stringContaining('images/profile.png'))
  })

  it('names the tech stack once for screen readers, not the decorative marquee copy', () => {
    render(<About />)
    expect(screen.getByText(`Tech stack: ${techStack.join(', ')}`)).toBeInTheDocument()
  })
})
