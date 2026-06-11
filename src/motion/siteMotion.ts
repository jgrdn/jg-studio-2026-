import gsap from 'gsap'
import { ScrollTrigger, Observer, Draggable } from './gsapPlugins'
import { initProjectTextScrub } from './projectTextPin'
import { initArchiveScrollAccelerator } from './archiveMarqueeMotion'
import type { Draggable as DraggableInstance } from 'gsap/Draggable'

export type SiteMotionOptions = {
  pathname: string
  reducedMotion: boolean
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function initRecognitionScrub() {
  const title = document.querySelector<HTMLElement>('.recognition-title')
  if (!title) return () => {}

  const tween = gsap.fromTo(
    title,
    { y: 32, opacity: 0.4 },
    {
      y: 0,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.recognition-section',
        start: 'top 88%',
        end: 'top 52%',
        scrub: 0.45,
      },
    },
  )

  return () => tween.scrollTrigger?.kill()
}

function initDraggableCarousels(root: ParentNode) {
  const tracks = root.querySelectorAll<HTMLElement>('.project-carousel__track--strip')
  const instances: DraggableInstance[] = []

  tracks.forEach((track) => {
    if (track.scrollWidth <= track.clientWidth + 2) return

    track.dataset.dragScroll = 'true'
    const draggables = Draggable.create(track, {
      type: 'scrollLeft',
      inertia: true,
      edgeResistance: 0.8,
      maxDuration: 1.35,
      minDuration: 0.3,
      dragClickables: true,
      allowContextMenu: true,
      onDragStart() {
        track.classList.add('is-dragging')
      },
      onDragEnd() {
        track.classList.remove('is-dragging')
      },
    })
    instances.push(...draggables)
  })

  return () => {
    instances.forEach((d) => d.kill())
    tracks.forEach((track) => {
      delete track.dataset.dragScroll
      track.classList.remove('is-dragging')
    })
  }
}

function getRow4MarqueeAnimation(inner: HTMLElement): Animation | null {
  const list = inner.getAnimations()
  const named = list.find(
    (a) => (a as CSSAnimation).animationName === 'project-carousel-marquee',
  )
  return named ?? list[0] ?? null
}

/** Ease marquee to a slow crawl on hover, then ramp back to full speed on leave. */
function initCarouselMarqueePause(root: ParentNode) {
  const observers: Observer[] = []
  const cleanups: Array<() => void> = []
  const HOVER_RATE = 0.14

  root
    .querySelectorAll<HTMLElement>('.project-carousel--row4 .project-carousel__marquee')
    .forEach((marquee) => {
      const inner = marquee.querySelector<HTMLElement>('.project-carousel__marquee-inner')
      if (!inner) return

      const playback = { rate: 1 }
      let cssAnim: Animation | null = null

      const bindAnimation = () => {
        if (cssAnim) return cssAnim
        cssAnim = getRow4MarqueeAnimation(inner)
        if (cssAnim) cssAnim.playbackRate = playback.rate
        return cssAnim
      }

      const syncRate = () => {
        bindAnimation()
        if (cssAnim) cssAnim.playbackRate = playback.rate
      }

      const rampRate = (target: number) => {
        if (!bindAnimation()) return

        gsap.killTweensOf(playback)
        gsap.to(playback, {
          rate: target,
          duration: target < 1 ? 0.95 : 0.85,
          ease: target < 1 ? 'power2.out' : 'power2.inOut',
          onUpdate: syncRate,
        })
      }

      requestAnimationFrame(bindAnimation)

      const obs = Observer.create({
        target: marquee,
        type: 'pointer',
        onHover: () => rampRate(HOVER_RATE),
        onHoverEnd: () => rampRate(1),
      })
      observers.push(obs)

      cleanups.push(() => {
        gsap.killTweensOf(playback)
        if (cssAnim) cssAnim.playbackRate = 1
      })
    })

  return () => {
    observers.forEach((o) => o.kill())
    cleanups.forEach((fn) => fn())
  }
}

/** Initialise route-aware GSAP enhancements. Returns a single cleanup. */
export function initSiteMotion({ pathname, reducedMotion }: SiteMotionOptions): () => void {
  if (reducedMotion || !isFinePointer()) return () => {}

  const cleanups: Array<() => void> = []
  const isHome = pathname === '/'
  const isProject = pathname.startsWith('/work/')
  const isArchive = pathname === '/work/archive'

  if (isHome) {
    cleanups.push(initRecognitionScrub())
  }

  const main = document.querySelector('main')

  if (main) {
    if (isProject && !isArchive) {
      cleanups.push(initProjectTextScrub(main))
    }
    cleanups.push(initDraggableCarousels(main))
    cleanups.push(initCarouselMarqueePause(main))
    if (isArchive) cleanups.push(initArchiveScrollAccelerator())
  }

  const refresh = () => ScrollTrigger.refresh()
  requestAnimationFrame(refresh)
  window.addEventListener('resize', refresh)

  return () => {
    window.removeEventListener('resize', refresh)
    cleanups.forEach((fn) => fn())
  }
}
