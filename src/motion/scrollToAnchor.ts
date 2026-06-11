import type Lenis from 'lenis'

/** Matches --scroll-anchor-offset (fixed nav band + section rhythm). */
export function getScrollAnchorOffset(): number {
  const nav = document.querySelector<HTMLElement>('.nav-shell')
  if (!nav) return 0

  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--grid-gap'))
  return nav.getBoundingClientRect().bottom + (Number.isFinite(gap) ? gap : 0)
}

export function scrollToAnchorId(
  id: string,
  lenis: Lenis | null,
  options?: { immediate?: boolean },
) {
  if (id === 'top') {
    if (lenis) lenis.scrollTo(0, { immediate: options?.immediate ?? false })
    else window.scrollTo({ top: 0, behavior: options?.immediate ? 'auto' : 'smooth' })
    return
  }

  const el = document.getElementById(id)
  if (!el) return

  const offset = getScrollAnchorOffset()
  const immediate = options?.immediate ?? false

  if (lenis) {
    lenis.scrollTo(el, { offset: -offset, immediate })
    return
  }

  el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' })
}

export function scrollToHash(
  hash: string,
  lenis: Lenis | null,
  options?: { immediate?: boolean },
) {
  const id = hash.replace(/^#/, '')
  if (!id) return
  scrollToAnchorId(id, lenis, options)
}
