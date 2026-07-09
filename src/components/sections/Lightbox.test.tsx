import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lightbox } from './Lightbox'

const photos = [
  { src: 'a.jpg', alt: 'A' },
  { src: 'b.jpg', alt: 'B' },
  { src: 'c.jpg', alt: 'C' },
]

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
})
