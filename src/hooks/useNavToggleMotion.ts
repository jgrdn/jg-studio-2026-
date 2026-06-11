import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

const CLOSED = [
  { x: -8, y: 0 },
  { x: 0, y: 0 },
  { x: 8, y: 0 },
] as const

const OPEN = [
  { x: 0, y: -8 },
  { x: 0, y: 0 },
  { x: 0, y: 8 },
] as const

function applyPositions(
  dots: HTMLElement[],
  positions: readonly { x: number; y: number }[],
) {
  dots.forEach((dot, i) => {
    gsap.set(dot, { x: positions[i].x, y: positions[i].y, scale: 1 })
  })
}

export function useNavToggleMotion(
  markRef: RefObject<HTMLElement | null>,
  menuOpen: boolean,
) {
  const reduced = usePrefersReducedMotion()
  const tweenRef = useRef<gsap.core.Timeline | null>(null)
  const initialisedRef = useRef(false)

  useLayoutEffect(() => {
    const mark = markRef.current
    if (!mark) return

    const dots = Array.from(mark.querySelectorAll<HTMLElement>('.nav-mark__dot'))
    if (dots.length !== 3) return

    gsap.set(dots, {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%',
    })

    tweenRef.current?.kill()

    if (!initialisedRef.current) {
      initialisedRef.current = true
      applyPositions(dots, menuOpen ? OPEN : CLOSED)
      return
    }

    if (reduced) {
      applyPositions(dots, menuOpen ? OPEN : CLOSED)
      return
    }

    const target = menuOpen ? OPEN : CLOSED

    if (menuOpen) {
      tweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(dots, {
          x: (i) => target[i].x,
          y: (i) => target[i].y,
          scale: (i) => (i === 1 ? 1.35 : 0.88),
          duration: 0.44,
          stagger: 0.07,
        })
        .to(dots, { scale: 1, duration: 0.24, ease: 'power2.out', stagger: 0.04 }, '-=0.18')
    } else {
      tweenRef.current = gsap.timeline().to(dots, {
        x: (i) => target[i].x,
        y: (i) => target[i].y,
        scale: 1,
        duration: 0.38,
        stagger: -0.065,
        ease: 'power3.inOut',
      })
    }

    return () => {
      tweenRef.current?.kill()
    }
  }, [menuOpen, reduced, markRef])
}
