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

  it.each([
    ['Live', (p: (typeof projects)[number]) => p.live],
    ['GitHub', (p: (typeof projects)[number]) => p.github],
  ])('shows a project\'s %s link once its row is open, opening in a new tab', async (label, href) => {
    const user = userEvent.setup()
    render(<Projects />)
    const i = projects.findIndex((p) => href(p))
    expect(i).toBeGreaterThanOrEqual(0)
    expect(screen.queryByRole('link', { name: `${label} ↗` })).toBeNull()

    await user.click(screen.getAllByRole('button')[i])
    const body = screen.getByRole('region', { name: projects[i].title })
    const link = within(body).getByRole('link', { name: `${label} ↗` })
    expect(link).toHaveAttribute('href', href(projects[i]))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows screenshots with their captions as alt text', async () => {
    const user = userEvent.setup()
    render(<Projects />)
    const i = projects.findIndex((p) => p.previews.length > 0)
    await user.click(screen.getAllByRole('button')[i])
    expect(screen.getByAltText(projects[i].previews[0].caption)).toBeInTheDocument()
  })

  it('enlarges a screenshot in the lightbox and steps through the project\'s shots', async () => {
    const user = userEvent.setup()
    render(<Projects />)
    const i = projects.findIndex((p) => p.previews.length > 1)
    const [first, second] = projects[i].previews
    await user.click(screen.getAllByRole('button')[i])
    await user.click(screen.getByRole('button', { name: `Enlarge screenshot: ${first.caption}` }))

    const dialog = screen.getByRole('dialog', { name: `Screenshot 1 of ${projects[i].previews.length}` })
    expect(within(dialog).getByAltText(first.caption).getAttribute('src')).toContain(first.full ?? first.src)
    await user.click(within(dialog).getByLabelText('Next screenshot'))
    expect(within(screen.getByRole('dialog')).getByAltText(second.caption)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
