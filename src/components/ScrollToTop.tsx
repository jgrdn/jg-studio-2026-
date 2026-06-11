import { useContext, useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LenisContext } from './SmoothScroll'
import { scrollToAnchorId } from '../motion/scrollToAnchor'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

export type HomeScrollState = {
  scrollTo?: string
}

/** Hash / section scroll only — route scroll-to-top happens after exit in PageTransitionLayout. */
export function ScrollToTop() {
  const { pathname, hash, state } = useLocation()
  const navigate = useNavigate()
  const lenis = useContext(LenisContext)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const scrollTo = (state as HomeScrollState | null)?.scrollTo

    if (hash) {
      const id = hash.replace(/^#/, '')
      navigate(pathname, { replace: true })
      requestAnimationFrame(() =>
        scrollToAnchorId(id, lenis, { immediate: reduced }),
      )
      return
    }

    if (scrollTo) {
      navigate(pathname, { replace: true, state: null })
      requestAnimationFrame(() =>
        scrollToAnchorId(scrollTo, lenis, { immediate: reduced }),
      )
    }
  }, [pathname, hash, state, lenis, reduced, navigate])

  return null
}
