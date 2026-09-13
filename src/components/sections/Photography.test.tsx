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

  it('lays photos into justified rows once the container is measured', () => {
    const callbacks: ResizeObserverCallback[] = []
    const original = global.ResizeObserver
    // Structurally satisfies the DOM ResizeObserver type, same as the setup.ts mock.
    global.ResizeObserver = class {
      constructor(cb: ResizeObserverCallback) {
        callbacks.push(cb)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    try {
      const { container } = render(<Photography items={fixture} />)
      act(() => {
        callbacks[0](
          [{ contentRect: { width: 1200 } }] as unknown as ResizeObserverEntry[],
          {} as ResizeObserver,
        )
      })

      const tiles = screen.getAllByRole('button')
      expect(tiles).toHaveLength(fixture.length)

      const firstWidth = Number.parseFloat((tiles[0] as HTMLElement).style.width)
      expect(firstWidth).toBeGreaterThan(0)
      expect(firstWidth).toBeLessThan(1200)

      // Row tiles get a pixel-based sizes attribute matching their computed width.
      const img = screen.getByAltText('Canal at dusk') as HTMLImageElement
      expect(img.getAttribute('sizes')).toBe(`${Math.round(firstWidth)}px`)

      expect(container.querySelectorAll('.flex').length).toBeGreaterThan(0)
    } finally {
      global.ResizeObserver = original
    }
  })
})
