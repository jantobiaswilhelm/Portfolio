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
