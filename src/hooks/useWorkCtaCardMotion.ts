import gsap from 'gsap'
import { useLayoutEffect, type RefObject } from 'react'
import { useMotionRefresh } from '../motion/MotionRefreshContext'
import { prefersReducedMotion } from '../motion/usePrefersReducedMotion'

/** Keep the full 1px stroke inside the card (avoids overflow:hidden clipping). */
const STROKE_INSET = 1

function readRadius(card: HTMLElement) {
  const raw = getComputedStyle(card).getPropertyValue('--radius-sm') || getComputedStyle(card).borderRadius
  const match = raw.match(/([\d.]+)px/)
  return match ? Number.parseFloat(match[1]) : 10
}

function fitAntsRect(card: HTMLElement) {
  const svg = card.querySelector<SVGSVGElement>('.project-card__slot-ants')
  const rect = card.querySelector<SVGRectElement>('.project-card__slot-ants__rect')
  if (!svg || !rect) return

  const box = svg.getBoundingClientRect()
  const w = Math.round(box.width * 100) / 100
  const h = Math.round(box.height * 100) / 100
  if (w < 2 || h < 2) return

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('preserveAspectRatio', 'none')

  const radius = Math.max(0, readRadius(card) - STROKE_INSET)
  const innerW = Math.max(0, w - STROKE_INSET * 2)
  const innerH = Math.max(0, h - STROKE_INSET * 2)

  rect.setAttribute('x', String(STROKE_INSET))
  rect.setAttribute('y', String(STROKE_INSET))
  rect.setAttribute('width', String(innerW))
  rect.setAttribute('height', String(innerH))
  rect.setAttribute('rx', String(radius))
  rect.setAttribute('ry', String(radius))
}

/** Grid drift + pixel-fit ants border on resize. */
export function useWorkCtaCardMotion(cardRef: RefObject<HTMLAnchorElement | null>) {
  const { generation } = useMotionRefresh()

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return

    const measure = () => fitAntsRect(card)
    measure()
    requestAnimationFrame(measure)

    const observer = new ResizeObserver(measure)
    observer.observe(card)

    if (prefersReducedMotion()) {
      return () => observer.disconnect()
    }

    const grid = card.querySelector<HTMLElement>('.project-card__slot-grid')
    let drift: gsap.core.Tween | undefined

    if (grid) {
      gsap.set(grid, { backgroundPosition: '0px 0px' })
      drift = gsap.to(grid, {
        backgroundPosition: '26px 26px',
        duration: 18,
        repeat: -1,
        ease: 'none',
      })
    }

    return () => {
      observer.disconnect()
      drift?.kill()
      if (grid) gsap.killTweensOf(grid)
    }
  }, [cardRef, generation])
}
