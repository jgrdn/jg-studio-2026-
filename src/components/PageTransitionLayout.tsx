import { useContext, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useOutlet } from 'react-router-dom'
import type Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from '../motion/gsapPlugins'
import {
  collectPageContentTargets,
  primePageContent,
  resetPageContent,
  runPageContentEnter,
  runPageContentExit,
} from '../motion/pageContentMotion'
import { useMotionRefresh } from '../motion/MotionRefreshContext'
import { resetScrollToTop, resetScrollToTopAfterPaint } from '../motion/scrollToTop'
import { LenisContext } from './SmoothScroll'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

function isFinePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function setPageContentState(main: HTMLElement | null, state: 'entering' | 'ready' | '') {
  if (!main) return
  if (state) main.dataset.pageContent = state
  else delete main.dataset.pageContent
}

function runEnterSequence(root: HTMLElement, lenis: Lenis | null, onComplete: () => void) {
  resetScrollToTopAfterPaint(lenis)

  const main = root.querySelector<HTMLElement>('main')
  if (!main) {
    onComplete()
    return gsap.timeline({ onComplete })
  }

  const targets = collectPageContentTargets(main)
  setPageContentState(main, 'entering')
  primePageContent(targets)

  const tl = runPageContentEnter(targets)
  tl.eventCallback('onComplete', () => {
    setPageContentState(main, 'ready')
    onComplete()
  })
  return tl
}

/** Content fades out → black gap → swap → fade in top-to-bottom. Nav stays outside. */
export function PageTransitionLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduced = usePrefersReducedMotion()
  const lenis = useContext(LenisContext)
  const { bump, setDisplayPath } = useMotionRefresh()
  const rootRef = useRef<HTMLDivElement>(null)
  const outletRef = useRef(outlet)
  outletRef.current = outlet

  const [activePath, setActivePath] = useState(location.pathname)
  const [displayedOutlet, setDisplayedOutlet] = useState(outlet)
  const isAnimatingRef = useRef(false)
  const didMountRef = useRef(false)

  useLayoutEffect(() => {
    if (didMountRef.current) return
    didMountRef.current = true

    const root = rootRef.current
    const animate = !reduced && isFinePointer()

    if (!root || !animate) {
      const main = root?.querySelector<HTMLElement>('main')
      setPageContentState(main ?? null, 'ready')
      bump()
      return
    }

    runEnterSequence(root, lenis, bump)
  }, [bump, reduced, lenis])

  useLayoutEffect(() => {
    if (location.pathname === activePath) return

    const root = rootRef.current
    const animate = !reduced && isFinePointer()

    const finishSwap = () => {
      resetScrollToTop(lenis)
      flushSync(() => {
        setActivePath(location.pathname)
        setDisplayedOutlet(outletRef.current)
        setDisplayPath(location.pathname)
      })
      resetScrollToTopAfterPaint(lenis)
    }

    const finishTransition = () => {
      isAnimatingRef.current = false
      root?.classList.remove('is-transitioning')
      resetScrollToTop(lenis)
      lenis?.start()
      ScrollTrigger.refresh()
      requestAnimationFrame(() => {
        resetScrollToTop(lenis)
        ScrollTrigger.refresh()
      })
    }

    if (!animate || !root) {
      finishSwap()
      requestAnimationFrame(() => {
        const main = root?.querySelector<HTMLElement>('main')
        setPageContentState(main ?? null, 'ready')
        bump()
        finishTransition()
      })
      return
    }

    if (isAnimatingRef.current) {
      gsap.killTweensOf(root)
    }
    isAnimatingRef.current = true
    root.classList.add('is-transitioning')
    lenis?.stop()

    const leavingMain = root.querySelector<HTMLElement>('main')
    const exitTargets = leavingMain ? collectPageContentTargets(leavingMain) : []

    const tl = gsap.timeline({ onComplete: finishTransition })

    tl.add(runPageContentExit(exitTargets))
    tl.call(() => {
      resetPageContent(exitTargets)
      finishSwap()
      bump()
    })
    tl.add(() => runEnterSequence(root, lenis, () => {}))

    return () => {
      tl.kill()
    }
  }, [location.pathname, activePath, reduced, lenis, bump, setDisplayPath])

  return (
    <div ref={rootRef} className="page-transition" data-path={activePath}>
      {displayedOutlet}
    </div>
  )
}
