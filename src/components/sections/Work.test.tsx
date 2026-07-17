import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Work } from './Work'

describe('Work accordion', () => {
  it('rows start collapsed', () => {
    render(<Work />)
    const buttons = screen.getAllByRole('button', { expanded: false })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('clicking a row expands it', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const first = screen.getAllByRole('button')[0]
    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
  })

  it('opening a second row collapses the first', async () => {
    const user = userEvent.setup()
    render(<Work />)
    const rows = screen.getAllByRole('button')
    await user.click(rows[0])
    await user.click(rows[1])
    expect(rows[0]).toHaveAttribute('aria-expanded', 'false')
    expect(rows[1]).toHaveAttribute('aria-expanded', 'true')
  })
})
