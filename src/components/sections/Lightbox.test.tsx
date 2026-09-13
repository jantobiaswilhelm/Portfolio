import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lightbox } from './Lightbox'
import type { Photo } from '../../data/photos-manifest'

const photo = (id: string, alt: string): Photo => ({
  id,
  w: 6240,
  h: 4160,
  widths: [400, 800, 1200, 1600],
  alt,
  altIsDefault: false,
  place: 'Venice',
  year: '2023',
  camera: 'Fujifilm X-T4',
  lens: 'XF16-55mmF2.8 R LM WR',
  focalLength: '23mm',
  aperture: 'f/2.8',
  iso: 200,
  lqip: 'data:image/webp;base64,AA',
})

const photos: Photo[] = [photo('a', 'A'), photo('b', 'B'), photo('c', 'C')]

describe('Lightbox', () => {
  it('renders nothing when index is null', () => {
    const { container } = render(<Lightbox photos={photos} index={null} onClose={() => {}} onChange={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the current frame number', () => {
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByText('01')).toBeInTheDocument()
  })

  it('advances with the next button', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={onChange} />)
    await user.click(screen.getByLabelText('Next photo'))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('wraps to the last frame when going previous from the first', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={onChange} />)
    await user.click(screen.getByLabelText('Previous photo'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Lightbox photos={photos} index={1} onClose={onClose} onChange={() => {}} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('Tab keeps focus within the dialog', async () => {
    const user = userEvent.setup()
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    const buttons = Array.from(dialog.querySelectorAll('button')) as HTMLElement[]
    expect(buttons.length).toBeGreaterThan(0)
    // Focus the last button, then Tab — should cycle back inside the dialog
    buttons[buttons.length - 1].focus()
    await user.keyboard('{Tab}')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('shows place, year, camera and lens for the open frame', () => {
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByText(/Venice, 2023/)).toBeInTheDocument()
    expect(screen.getByText(/Fujifilm X-T4/)).toBeInTheDocument()
    expect(screen.getByText(/XF16-55mmF2\.8/)).toBeInTheDocument()
  })

  it('loads a derivative rather than an original', () => {
    render(<Lightbox photos={photos} index={0} onClose={() => {}} onChange={() => {}} />)
    const img = screen.getByAltText('A') as HTMLImageElement
    expect(img.getAttribute('src')).toContain('-1600.jpg')
  })

  it('falls back to the largest width a narrow photo actually has', () => {
    const narrow: Photo = { ...photo('n', 'N'), w: 1440, h: 960, widths: [400, 800, 1200] }
    render(<Lightbox photos={[narrow]} index={0} onClose={() => {}} onChange={() => {}} />)
    const img = screen.getByAltText('N') as HTMLImageElement
    expect(img.getAttribute('src')).toContain('-1200.jpg')
    expect(img.getAttribute('src')).not.toContain('-1600')
  })
})
