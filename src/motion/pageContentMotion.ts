import gsap from 'gsap'

const EXIT = { duration: 0.6, stagger: 0.09, ease: 'power2.in' as const }
const ENTER = { duration: 0.88, stagger: 0.14, ease: 'power1.out' as const, y: 18 }
const HOLD_BLACK = 0.12
const AMBIENT_DIM = { duration: 0.42, ease: 'power2.in' as const }

/** Top-to-bottom sections for load / route enter. */
export function collectPageContentTargets(main: HTMLElement): HTMLElement[] {
  if (main.classList.contains('project-page--case')) {
    const stack = main.querySelector('.project-page__stack')
    const blocks = stack ? (Array.from(stack.children) as HTMLElement[]) : []
    const contact = main.querySelector<HTMLElement>('.contact-section')
    return contact ? [...blocks, contact] : blocks
  }

  if (main.classList.contains('archive-page')) {
    return Array.from(main.querySelectorAll<HTMLElement>('.archive-wall__col'))
  }

  const items = [
    main.querySelector<HTMLElement>('.home-intro__copy'),
    main.querySelector<HTMLElement>('.home-intro__media'),
    main.querySelector<HTMLElement>('.brands-stack'),
    document.querySelector<HTMLElement>('.agency-marquee__inner'),
    main.querySelector<HTMLElement>('#work'),
    main.querySelector<HTMLElement>('.recognition-section'),
    main.querySelector<HTMLElement>('.contact-section'),
  ].filter((el): el is HTMLElement => Boolean(el))

  return items
}

export function primePageContent(targets: HTMLElement[]) {
  if (!targets.length) return
  gsap.set(targets, { opacity: 0, y: ENTER.y, force3D: true })
}

export function resetPageContent(targets: HTMLElement[]) {
  targets.forEach((el) => {
    gsap.killTweensOf(el)
    gsap.set(el, { clearProps: 'opacity,transform' })
  })
}

export function fadeAmbientToBlack(duration = AMBIENT_DIM.duration) {
  const root = document.documentElement
  gsap.killTweensOf(root, [
    '--ambient-base',
    '--ambient-glow-a',
    '--ambient-glow-b',
    '--ambient-glow-opacity',
  ])
  return gsap.to(root, {
    '--ambient-base': 'rgb(0, 0, 0)',
    '--ambient-glow-a': 'rgba(0, 0, 0, 0)',
    '--ambient-glow-b': 'rgba(0, 0, 0, 0)',
    '--ambient-glow-opacity': 0,
    duration,
    ease: AMBIENT_DIM.ease,
    overwrite: 'auto',
  })
}

export function runPageContentExit(targets: HTMLElement[]): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: EXIT.ease } })

  if (targets.length) {
    tl.to(
      targets,
      {
        opacity: 0,
        y: -8,
        duration: EXIT.duration,
        stagger: EXIT.stagger,
      },
      0,
    )
  }

  tl.add(fadeAmbientToBlack(), 0)
  if (targets.length || HOLD_BLACK > 0) {
    tl.to({}, { duration: HOLD_BLACK })
  }

  return tl
}

export function runPageContentEnter(targets: HTMLElement[]): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: ENTER.ease } })

  if (targets.length) {
    tl.to(targets, {
      opacity: 1,
      y: 0,
      duration: ENTER.duration,
      stagger: ENTER.stagger,
      clearProps: 'transform',
    })
  }

  return tl
}
