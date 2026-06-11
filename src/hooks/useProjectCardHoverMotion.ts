import gsap from 'gsap'
import { useEffect, type RefObject } from 'react'
import { motionTokens } from '../motion/motionTokens'
import { prefersReducedMotion } from '../motion/usePrefersReducedMotion'

const { duration, ease, scale, opacity } = motionTokens

function textTransformOrigin(card: HTMLElement): string {
  if (card.classList.contains('project-card--adjacent-next')) return '100% 100%'
  return '0% 100%'
}

function cardTargets(card: HTMLElement) {
  const media = card.querySelector<HTMLElement>('.project-card__media')
  const title = card.querySelector<HTMLElement>('.project-card__text h3')
  const subtitle = card.querySelector<HTMLElement>('.project-card__text p')
  return { media, title, subtitle }
}

function playHoverIn(card: HTMLElement) {
  const { media, title, subtitle } = cardTargets(card)
  if (!media || !title) return

  const mediaScale = card.classList.contains('project-card--adjacent')
    ? scale.cardMediaAdjacent
    : scale.cardMedia
  const origin = textTransformOrigin(card)

  gsap.killTweensOf([media, title, subtitle].filter(Boolean))

  gsap.set(media, { transformOrigin: '50% 50%', force3D: true })
  gsap.set([title, subtitle].filter(Boolean), { transformOrigin: origin, force3D: true })

  const tl = gsap.timeline({
    defaults: { ease: ease.hoverEnter, overwrite: 'auto' },
  })

  tl.to(
    media,
    {
      opacity: opacity.cardMediaHover,
      scale: mediaScale,
      duration: duration.hoverEnter,
    },
    0,
  )
  tl.to(
    title,
    { scale: scale.cardTitle, duration: duration.hoverEnter * 0.92 },
    0.05,
  )
  if (subtitle) {
    tl.to(
      subtitle,
      { scale: scale.cardSubtitle, duration: duration.hoverEnter * 0.86 },
      0.09,
    )
  }

  return tl
}

function playHoverOut(card: HTMLElement) {
  const { media, title, subtitle } = cardTargets(card)
  const nodes = [media, title, subtitle].filter(Boolean) as HTMLElement[]
  if (!nodes.length) return

  gsap.killTweensOf(nodes)
  gsap.to(nodes, {
    opacity: 1,
    scale: 1,
    duration: duration.hoverLeave,
    ease: ease.hoverLeave,
    stagger: 0.03,
    overwrite: 'auto',
  })
}

function resolveCard(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const card = target.closest<HTMLElement>('.project-card')
  if (card?.classList.contains('project-card--cta-slot')) return null
  return card
}

function staysInsideCard(card: HTMLElement, related: EventTarget | null): boolean {
  return related instanceof Node && card.contains(related)
}

/** GSAP hover timeline for project cards (work grid + adjacent nav). */
export function useProjectCardHoverMotion(
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let activeCard: HTMLElement | null = null

    const onOver = (e: Event) => {
      const card = resolveCard(e.target)
      if (!card || !root.contains(card) || card === activeCard) return
      if (activeCard) playHoverOut(activeCard)
      activeCard = card
      playHoverIn(card)
    }

    const onOut = (e: Event) => {
      const card = resolveCard(e.target)
      if (!card || !root.contains(card)) return
      const related =
        e instanceof MouseEvent || e instanceof FocusEvent ? e.relatedTarget : null
      if (staysInsideCard(card, related)) return
      if (activeCard === card) activeCard = null
      playHoverOut(card)
    }

    root.addEventListener('mouseover', onOver)
    root.addEventListener('mouseout', onOut)
    root.addEventListener('focusin', onOver)
    root.addEventListener('focusout', onOut)

    return () => {
      root.removeEventListener('mouseover', onOver)
      root.removeEventListener('mouseout', onOut)
      root.removeEventListener('focusin', onOver)
      root.removeEventListener('focusout', onOut)
      if (activeCard) playHoverOut(activeCard)
      root.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
        const { media, title, subtitle } = cardTargets(card)
        gsap.killTweensOf([media, title, subtitle].filter(Boolean))
        gsap.set([media, title, subtitle].filter(Boolean), {
          clearProps: 'opacity,transform',
        })
      })
    }
  }, [containerRef])
}
