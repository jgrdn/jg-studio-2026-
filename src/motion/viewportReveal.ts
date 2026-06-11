import gsap from 'gsap'

/** Blocks that should fade in/out on scroll (nested matches are collapsed to the innermost). */
export const VIEWPORT_REVEAL_SELECTOR = [
  '[data-viewport-reveal]',
  'main .project-grid-ul > li',
  'main .contact-section__grid > *',
].join(', ')

const VISIBLE_RATIO = 0.04
const MAX_STAGGER = 0.1
const STAGGER_STEP = 0.02
const ENTER_DURATION = 0.42
const LEAVE_DURATION = 0.34
const ENTER_OFFSET = 8
const LEAVE_OFFSET = 6
/** Items already on screen when the page loads — quick polish, not a full hide. */
const INITIAL_ENTER_DURATION = 0.28

export type ViewportRevealOptions = {
  reducedMotion: boolean
}

function staggerDelay(el: Element, group: Element[]): number {
  const parent = el.parentElement
  if (!parent) return 0
  const siblings = group.filter((node) => node.parentElement === parent)
  const index = siblings.indexOf(el)
  if (index < 0) return 0
  return Math.min(index * STAGGER_STEP, MAX_STAGGER)
}

/** Prefer the most specific (deepest) nodes when selectors overlap. */
export function collectRevealTargets(root: ParentNode): HTMLElement[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(VIEWPORT_REVEAL_SELECTOR))
  return nodes.filter(
    (el) =>
      !nodes.some((other) => other !== el && el.contains(other)) &&
      !el.closest('[data-viewport-reveal="off"]'),
  )
}

function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
  return visible > 0 && visible / Math.max(rect.height, 1) >= VISIBLE_RATIO
}

export function primeRevealTarget(el: HTMLElement, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' })
    delete el.dataset.viewportRevealPending
    return
  }
  el.dataset.viewportRevealPending = ''
  gsap.set(el, { opacity: 0, y: ENTER_OFFSET, force3D: true })
}

/** Above-the-fold on first paint — avoid a blank “still loading” moment. */
export function revealInitialInView(el: HTMLElement, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' })
    delete el.dataset.viewportRevealPending
    return
  }
  delete el.dataset.viewportRevealPending
  gsap.fromTo(
    el,
    { opacity: 0.82, y: 5 },
    {
      opacity: 1,
      y: 0,
      duration: INITIAL_ENTER_DURATION,
      ease: 'power2.out',
      overwrite: 'auto',
    },
  )
}

export function setRevealVisible(
  el: HTMLElement,
  visible: boolean,
  reducedMotion: boolean,
  delay = 0,
) {
  if (reducedMotion) {
    gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' })
    delete el.dataset.viewportRevealPending
    return
  }

  gsap.to(el, {
    opacity: visible ? 1 : 0,
    y: visible ? 0 : LEAVE_OFFSET,
    duration: visible ? ENTER_DURATION : LEAVE_DURATION,
    delay: visible ? delay : 0,
    ease: visible ? 'power2.out' : 'power1.in',
    overwrite: 'auto',
    onComplete: () => {
      if (visible) delete el.dataset.viewportRevealPending
    },
  })
}

export function createViewportRevealController(
  root: ParentNode,
  { reducedMotion }: ViewportRevealOptions,
) {
  const group = collectRevealTargets(root)
  const visible = new WeakSet<Element>()

  group.forEach((el) => {
    if (reducedMotion) {
      primeRevealTarget(el, true)
      return
    }
    if (isInViewport(el)) {
      visible.add(el)
      revealInitialInView(el, false)
      return
    }
    primeRevealTarget(el, false)
  })

  const observer = new IntersectionObserver(
    (entries) => {
      if (reducedMotion) return

      for (const entry of entries) {
        const el = entry.target as HTMLElement
        const show =
          entry.isIntersecting &&
          entry.intersectionRatio >= VISIBLE_RATIO

        if (show && !visible.has(el)) {
          visible.add(el)
          setRevealVisible(el, true, false, staggerDelay(el, group))
        } else if (!show && visible.has(el)) {
          visible.delete(el)
          setRevealVisible(el, false, false)
        }
      }
    },
    {
      root: null,
      rootMargin: '0px 0px 14% 0px',
      threshold: [0, VISIBLE_RATIO, 0.2],
    },
  )

  group.forEach((el) => observer.observe(el))

  return () => {
    observer.disconnect()
    group.forEach((el) => {
      gsap.killTweensOf(el)
      gsap.set(el, { clearProps: 'opacity,transform' })
      delete el.dataset.viewportRevealPending
    })
  }
}
