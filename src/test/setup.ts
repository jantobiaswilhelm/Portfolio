import '@testing-library/jest-dom'

// matchMedia (used by usePrefersReducedMotion)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

// scrollTo (jsdom prints "Not implemented: window.scrollTo" without this)
window.scrollTo = () => {}

// IntersectionObserver (used by framer-motion whileInView / onViewportEnter)
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
// @ts-expect-error assign to global
global.IntersectionObserver = MockIntersectionObserver

// ResizeObserver (used by the justified photo grid to track container width)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Unlike the IntersectionObserver mock above, this one structurally satisfies
// the DOM ResizeObserver type, so it needs no @ts-expect-error. Adding one
// would itself be an error (TS2578, unused directive).
global.ResizeObserver = MockResizeObserver
