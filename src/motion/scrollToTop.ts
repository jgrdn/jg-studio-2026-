import type Lenis from 'lenis'

/** Force scroll to top — native + Lenis, repeat after paint for route swaps. */
export function resetScrollToTop(lenis: Lenis | null) {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  lenis?.scrollTo(0, { immediate: true })
}

export function resetScrollToTopAfterPaint(lenis: Lenis | null) {
  resetScrollToTop(lenis)
  requestAnimationFrame(() => {
    resetScrollToTop(lenis)
    requestAnimationFrame(() => resetScrollToTop(lenis))
  })
}
