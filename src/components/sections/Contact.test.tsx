import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Contact } from './Contact'
import { socials } from '../../data/socials'

describe('Contact', () => {
  it('reads as one heading, not a pile of letters', () => {
    render(<Contact />)
    expect(screen.getByRole('heading', { level: 2, name: "Let's build something." })).toBeInTheDocument()
  })

  it('makes the shutter button the email link', () => {
    render(<Contact />)
    const email = socials.find((s) => s.href.startsWith('mailto:'))!
    const btn = screen.getByRole('link', { name: 'Email Jan' })
    expect(btn).toHaveAttribute('href', email.href)
  })

  it('fires without errors where there is no Web Audio or WAAPI', async () => {
    const user = userEvent.setup()
    render(<Contact />)
    const btn = screen.getByRole('link', { name: 'Email Jan' })
    btn.addEventListener('click', (e) => e.preventDefault()) // jsdom can't navigate to mailto:
    await user.click(btn)
  })

  it('lists every other social as an external link', () => {
    render(<Contact />)
    for (const s of socials.filter((x) => !x.href.startsWith('mailto:'))) {
      const link = screen.getByRole('link', { name: `${s.label} ↗` })
      expect(link).toHaveAttribute('href', s.href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })
})
