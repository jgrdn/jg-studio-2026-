import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

const PANEL_MAX = 520

function measurePanelHeight(panel: HTMLElement): number {
  const prevMax = panel.style.maxHeight
  const prevOpacity = panel.style.opacity
  panel.style.maxHeight = 'none'
  panel.style.opacity = '1'
  const height = Math.min(panel.scrollHeight, window.innerHeight * 0.7, PANEL_MAX)
  panel.style.maxHeight = prevMax
  panel.style.opacity = prevOpacity
  return height
}

export function useNavPanelMotion(
  panelRef: RefObject<HTMLDivElement | null>,
  menuOpen: boolean,
) {
  const reduced = usePrefersReducedMotion()
  const tweenRef = useRef<gsap.core.Timeline | null>(null)
  const initialisedRef = useRef(false)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const items = panel.querySelectorAll<HTMLElement>('.menu-nav li')
    const footer = panel.querySelector<HTMLElement>('.nav-shell__footer')

    tweenRef.current?.kill()

    if (!initialisedRef.current) {
      initialisedRef.current = true
      if (!reduced && !menuOpen) {
        gsap.set(panel, { maxHeight: 0, opacity: 0, paddingBottom: 0 })
        gsap.set(items, { opacity: 0, y: 10 })
        if (footer) gsap.set(footer, { opacity: 0, y: 6 })
        return
      }
    }

    if (reduced) {
      gsap.set(panel, { clearProps: 'maxHeight,opacity,paddingBottom' })
      gsap.set(items, { clearProps: 'opacity,transform' })
      if (footer) gsap.set(footer, { clearProps: 'opacity,transform' })
      return
    }

    if (menuOpen) {
      const targetHeight = measurePanelHeight(panel)
      panel.style.pointerEvents = 'auto'

      gsap.set(items, { opacity: 0, y: 10 })
      if (footer) gsap.set(footer, { opacity: 0, y: 6 })

      tweenRef.current = gsap
        .timeline()
        .to(panel, {
          maxHeight: targetHeight,
          opacity: 1,
          paddingBottom: 'var(--pad)',
          duration: 0.38,
          ease: 'power2.out',
        })
        .to(
          items,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.055,
            ease: 'power2.out',
          },
          '-=0.2',
        )
        .to(
          footer,
          {
            opacity: 1,
            y: 0,
            duration: 0.26,
            ease: 'power2.out',
          },
          '-=0.16',
        )
    } else {
      panel.style.pointerEvents = 'none'

      tweenRef.current = gsap
        .timeline()
        .to(items, {
          opacity: 0,
          y: 6,
          duration: 0.16,
          stagger: -0.035,
          ease: 'power2.in',
        })
        .to(
          footer,
          {
            opacity: 0,
            y: 4,
            duration: 0.14,
            ease: 'power2.in',
          },
          '-=0.1',
        )
        .to(
          panel,
          {
            maxHeight: 0,
            opacity: 0,
            paddingBottom: 0,
            duration: 0.28,
            ease: 'power2.in',
          },
          '-=0.06',
        )
    }

    return () => {
      tweenRef.current?.kill()
    }
  }, [menuOpen, reduced, panelRef])
}
