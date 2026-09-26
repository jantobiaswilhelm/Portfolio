import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Projects } from './Projects'
import { projects } from '../../data/projects'

describe('Projects accordion', () => {
  it('is headed "Projects"', () => {
    render(<Projects />)
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
  })

  it('rows start collapsed', () => {
    render(<Projects />)
    const buttons = screen.getAllByRole('button', { expanded: false })
    expect(buttons).toHaveLength(projects.length)
  })

  it('clicking a row expands it', async () => {
    const user = userEvent.setup()
    render(<Projects />)
    const first = screen.getAllByRole('button')[0]
    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
  })

  it('opening a second row collapses the first', async () => {
    const user = userEvent.setup()
    render(<Projects />)
    const rows = screen.getAllByRole('button')
    await user.click(rows[0])
    await user.click(rows[1])
    expect(rows[0]).toHaveAttribute('aria-expanded', 'false')
    expect(rows[1]).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows a project\'s links once its row is open, opening in a new tab', async () => {
    const user = userEvent.setup()
    render(<Projects />)
    const i = projects.findIndex((p) => p.live && p.github)
    expect(i).toBeGreaterThanOrEqual(0)
    expect(screen.queryByRole('link', { name: /Live/ })).toBeNull()

    await user.click(screen.getAllByRole('button')[i])
    const body = screen.getByRole('region', { name: projects[i].title })
    const live = within(body).getByRole('link', { name: 'Live ↗' })
    expect(live).toHaveAttribute('href', projects[i].live)
    expect(live).toHaveAttribute('target', '_blank')
    expect(live).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(body).getByRole('link', { name: 'GitHub ↗' })).toHaveAttribute('href', projects[i].github)
  })

  it('shows screenshots with their captions as alt text', async () => {
    const user = userEvent.setup()
    render(<Projects />)
    const i = projects.findIndex((p) => p.previews.length > 0)
    await user.click(screen.getAllByRole('button')[i])
    expect(screen.getByAltText(projects[i].previews[0].caption)).toBeInTheDocument()
  })
})
