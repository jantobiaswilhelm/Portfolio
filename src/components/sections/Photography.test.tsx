import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Photography } from './Photography'
import type { Photo } from '../../data/photos-manifest'

const photo = (id: string, alt: string, w: number, h: number): Photo => ({
  id,
  w,
  h,
  widths: [400, 800, 1200].filter((x) => x <= w),
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

const fixture: Photo[] = [
  photo('venice-2023/one', 'Canal at dusk', 1500, 1000),
  photo('venice-2023/two', 'Narrow alley', 1000, 1500),
  photo('venice-2023/three', 'Rialto bridge', 1500, 1000),
]

describe('Photography grid', () => {
  it('renders every photo as a focusable button', () => {
    render(<Photography items={fixture} />)
    const tiles = screen.getAllByRole('button')
    expect(tiles).toHaveLength(fixture.length)
  })

  it('gives each tile real alt text, never a placeholder', () => {
    render(<Photography items={fixture} />)
    expect(screen.getByAltText('Canal at dusk')).toBeInTheDocument()
    expect(screen.getByAltText('Narrow alley')).toBeInTheDocument()
    expect(screen.queryByAltText(/^Photo \d+$/)).toBeNull()
  })

  it('sets explicit intrinsic dimensions on every image', () => {
    render(<Photography items={fixture} />)
    const img = screen.getByAltText('Canal at dusk') as HTMLImageElement
    expect(img.getAttribute('width')).toBe('1500')
    expect(img.getAttribute('height')).toBe('1000')
  })

  it('never offers a srcset width the photo does not have', () => {
    render(<Photography items={fixture} />)
    const img = screen.getByAltText('Narrow alley') as HTMLImageElement
    expect(img.getAttribute('srcset')).toContain('-400.jpg')
    expect(img.getAttribute('srcset')).toContain('-800.jpg')
    expect(img.getAttribute('srcset')).not.toContain('-1200')
  })

  it('opens the lightbox from the keyboard', async () => {
    const user = userEvent.setup()
    render(<Photography items={fixture} />)
    const tiles = screen.getAllByRole('button')
    tiles[1].focus()
    expect(document.activeElement).toBe(tiles[1])
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Photo 2 of 3')
  })

  it('renders no tiles when there are no photos', () => {
    render(<Photography items={[]} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('does not request natural-resolution images before measurement', () => {
    render(<Photography items={fixture} />)
    const img = screen.getByAltText('Canal at dusk') as HTMLImageElement
    expect(img.getAttribute('sizes')).not.toMatch(/^\d{4,}px$/)
  })

  it('sizes every image for the column it sits in', () => {
    render(<Photography items={fixture} />)
    const img = screen.getByAltText('Canal at dusk') as HTMLImageElement
    expect(img.getAttribute('sizes')).toBe('(max-width: 600px) 50vw, (max-width: 1000px) 33vw, (max-width: 1400px) 25vw, 300px')
  })

  it('lays photos into columns for the viewport width, each photo exactly once', () => {
    const { container } = render(<Photography items={fixture} />)
    // jsdom's default viewport is 1024px wide → 4 columns
    expect(container.querySelectorAll('.col')).toHaveLength(4)
    const inColumns = container.querySelectorAll('.col .tile')
    expect(inColumns).toHaveLength(fixture.length)
  })

  it('re-lays the columns when the viewport narrows to a phone', () => {
    const original = window.innerWidth
    try {
      const { container } = render(<Photography items={fixture} />)
      act(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
        window.dispatchEvent(new Event('resize'))
      })
      expect(container.querySelectorAll('.col')).toHaveLength(2)
      expect(screen.getAllByRole('button')).toHaveLength(fixture.length)
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: original })
    }
  })

  it('tells the viewfinder cursor each frame’s exposure', () => {
    render(<Photography items={fixture} />)
    const tile = screen.getAllByRole('button')[0]
    expect(tile).toHaveAttribute('data-cursor', 'photo')
    expect(tile).toHaveAttribute('data-exif', '23mm · f/2.8 · ISO 200')
  })

  it('counts the frames in the section subtitle', () => {
    render(<Photography items={fixture} />)
    expect(screen.getByText(/^3 frames/)).toBeInTheDocument()
  })
})
