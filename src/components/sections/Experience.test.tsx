import { describe, it, expect } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import { Experience } from './Experience'
import { timeline, certifications } from '../../data/timeline'
import { languages } from '../../data/about'

const barName = (t: (typeof timeline)[number]) => `${t.title}${t.org ? `, ${t.org}` : ''}, ${t.year}`

describe('Experience', () => {
  it('is the #experience section with an accessible heading', () => {
    const { container } = render(<Experience />)
    expect(container.querySelector('section#experience')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
  })

  it('opens with what Jan is doing right now', () => {
    const { container } = render(<Experience />)
    const now = within(container.querySelector('.now-cards') as HTMLElement)
    expect(now.getByText('Support Hero')).toBeInTheDocument()
    expect(now.getByText('MSc Business Information Systems')).toBeInTheDocument()
    expect(now.getAllByRole('heading', { level: 3 })).toHaveLength(timeline.filter((t) => t.current).length)
  })

  it('renders every timeline entry as a labelled, focusable bar', () => {
    render(<Experience />)
    for (const t of timeline) {
      expect(screen.getByRole('button', { name: barName(t) })).toBeInTheDocument()
    }
  })

  it('lists every entry in the phone layout too', () => {
    const { container } = render(<Experience />)
    const list = container.querySelector('.tl') as HTMLElement
    expect(list.querySelectorAll('.ent')).toHaveLength(timeline.length)
  })

  it('shows certifications and languages', () => {
    render(<Experience />)
    for (const c of certifications) expect(screen.getAllByText(c.name).length).toBeGreaterThan(0)
    expect(screen.getByText(languages.join(' · '))).toBeInTheDocument()
  })

  it('starts the detail card on the oldest entry', () => {
    const { container } = render(<Experience />)
    const detail = within(container.querySelector('.detail') as HTMLElement)
    expect(detail.getByText('WMS (Federal VET Diploma)')).toBeInTheDocument()
  })

  it('shows the details of a bar that gets keyboard focus', () => {
    const { container } = render(<Experience />)
    const aarhus = timeline.find((t) => t.short === 'Aarhus')!
    act(() => screen.getByRole('button', { name: barName(aarhus) }).focus())
    const detail = within(container.querySelector('.detail') as HTMLElement)
    expect(detail.getByText('Exchange Semester')).toBeInTheDocument()
    expect(detail.getByText('Erhvervsakademiet Aarhus')).toBeInTheDocument()
  })

  it('draws the planned remainder of the MSc as a tail', () => {
    const { container } = render(<Experience />)
    expect(container.querySelector('.plan')?.textContent).toContain('2027')
  })
})
