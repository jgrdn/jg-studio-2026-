import { useContext, useLayoutEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useLocation } from 'react-router-dom'
import { LenisContext } from './SmoothScroll'
import { connectLenisScrollTrigger } from '../motion/lenisScrollTrigger'
import { useMotionRefresh } from '../motion/MotionRefreshContext'
import { registerGsapPlugins } from '../motion/gsapPlugins'
import { initSiteMotion } from '../motion/siteMotion'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

function isFinePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** Sitewide GSAP: ScrollTrigger + Lenis, hero entrance, parallax, drag carousels, observers. */
export function GsapEnhancements() {
  const { pathname } = useLocation()
  const { generation } = useMotionRefresh()
  const reduced = usePrefersReducedMotion()
  const lenis = useContext(LenisContext)
  const fine = isFinePointer()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  useLayoutEffect(() => {
    registerGsapPlugins()
  }, [])

  useLayoutEffect(() => {
    if (!lenis || reduced || !fine) return
    return connectLenisScrollTrigger(lenis)
  }, [lenis, reduced, fine])

  useGSAP(
    () => {
      if (reduced || !fine) return
      return initSiteMotion({ pathname: pathnameRef.current, reducedMotion: reduced })
    },
    { dependencies: [generation, reduced, fine], revertOnUpdate: true },
  )

  return null
}
