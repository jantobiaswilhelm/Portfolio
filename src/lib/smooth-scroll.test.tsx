import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SmoothScrollProvider } from './smooth-scroll'
import { Lightbox } from '../components/sections/Lightbox'
import type { Photo } from '../data/photos-manifest'

const frame: Photo = {
  id: 'venice-2023/one',
  w: 6240,
  h: 4160,
  widths: [400, 800, 1200, 1600],
  alt: 'Canal at dusk',
  altIsDefault: false,
  place: 'Venice',
  year: '2023',
  camera: 'Fujifilm X-T4',
  lens: 'XF16-55mmF2.8 R LM WR',
  focalLength: '23mm',
  aperture: 'f/2.8',
  iso: 200,
  lqip: 'data:image/webp;base64,AA',
}

/**
 * Regression cover for the audit finding that the page scrolled behind the open
 * lightbox. Lenis runs its own RAF loop and ignores the modal, so the provider
 * pins native overflow as well as stopping Lenis. Verified by hand in a browser;
 * these lock it in.
 */
describe('scroll lock', () => {
  it('does not pin the page when the lightbox is closed', () => {
    render(
      <SmoothScrollProvider>
        <Lightbox photos={[frame]} index={null} onClose={() => {}} onChange={() => {}} />
      </SmoothScrollProvider>,
    )
    expect(document.body.style.overflow).toBe('')
  })

  it('pins the page while the lightbox is open', () => {
    render(
      <SmoothScrollProvider>
        <Lightbox photos={[frame]} index={0} onClose={() => {}} onChange={() => {}} />
      </SmoothScrollProvider>,
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('releases the page when the lightbox unmounts', () => {
    const { unmount } = render(
      <SmoothScrollProvider>
        <Lightbox photos={[frame]} index={0} onClose={() => {}} onChange={() => {}} />
      </SmoothScrollProvider>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('releases the page when the lightbox is closed with Escape', async () => {
    const user = userEvent.setup()
    function Harness() {
      return (
        <SmoothScrollProvider>
          <Lightbox photos={[frame]} index={0} onClose={() => {}} onChange={() => {}} />
        </SmoothScrollProvider>
      )
    }
    const { rerender } = render(<Harness />)
    expect(document.body.style.overflow).toBe('hidden')
    await user.keyboard('{Escape}')
    // onClose is wired by the parent; closing is modelled by rendering index=null
    rerender(
      <SmoothScrollProvider>
        <Lightbox photos={[frame]} index={null} onClose={() => {}} onChange={() => {}} />
      </SmoothScrollProvider>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })
})
