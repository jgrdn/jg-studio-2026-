import gsap from 'gsap'

const MARQUEE_INNER_SEL = '.archive-wall__marquee-inner'

type PlaybackState = { rate: number }

const playbackByInner = new WeakMap<HTMLElement, PlaybackState>()

// Shared wheel-driven speed boost applied on top of every row's base rate.
const accel = { boost: 0 }

function getPlayback(inner: HTMLElement): PlaybackState {
  let state = playbackByInner.get(inner)
  if (!state) {
    state = { rate: 1 }
    playbackByInner.set(inner, state)
  }
  return state
}

function getMarqueeAnimation(inner: HTMLElement): Animation | null {
  const list = inner.getAnimations()
  const named = list.find(
    (a) => (a as CSSAnimation).animationName === 'archive-marquee-vert',
  )
  return named ?? list[0] ?? null
}

function syncInnerRate(inner: HTMLElement) {
  const anim = getMarqueeAnimation(inner)
  if (!anim) return
  // Boost can drive the rate negative (< -1) so the sliders run in reverse.
  anim.playbackRate = getPlayback(inner).rate * (1 + accel.boost)
}

function getArchiveMarqueeInners(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(MARQUEE_INNER_SEL))
}

/** Ramp all archive rows to `targetRate` (0 = stopped, 1 = full speed). */
export function rampArchiveMarquees(
  targetRate: number,
  duration = targetRate < 1 ? 1.05 : 0.9,
): gsap.core.Timeline {
  const inners = getArchiveMarqueeInners()
  const tl = gsap.timeline()

  inners.forEach((inner) => {
    const playback = getPlayback(inner)
    gsap.killTweensOf(playback)
    syncInnerRate(inner)

    tl.to(
      playback,
      {
        rate: targetRate,
        duration,
        ease: targetRate < 1 ? 'power2.out' : 'power2.inOut',
        onUpdate: () => syncInnerRate(inner),
      },
      0,
    )
  })

  return tl
}

/**
 * Wheel-driven accelerator for the archive wall. The page itself doesn't
 * scroll — wheel impulses fill a momentum reservoir, and the live boost
 * follows it with exponential smoothing (no spring overshoot = no jump).
 */
export function initArchiveScrollAccelerator(): () => void {
  const MAX_BOOST = 16 // forward ceiling (rate up to 17x)
  const MIN_BOOST = -10 // reverse floor
  const WHEEL_FACTOR = 0.013 // energy per scroll tick
  const RESERVOIR_FRICTION = 0.91 // afterlife decay (per 60fps frame, dt-scaled)
  const FOLLOW_ATTACK = 11 // how fast boost catches up while scrolling (1/s)
  const FOLLOW_RELEASE = 7 // gentler settle back to idle (1/s)

  let reservoir = 0

  const onWheel = (e: WheelEvent) => {
    // Don't fight the open/close ramp while an image is being viewed.
    if (document.body.classList.contains('is-archive-viewing')) return
    reservoir += e.deltaY * WHEEL_FACTOR
    reservoir = Math.max(MIN_BOOST, Math.min(MAX_BOOST, reservoir))
  }

  const update = () => {
    const dt = gsap.ticker.deltaRatio() / 60
    if (dt <= 0) return

    if (reservoir === 0 && Math.abs(accel.boost) < 0.001) {
      accel.boost = 0
      return
    }

    // Reservoir slowly bleeds away — the afterlife.
    reservoir *= RESERVOIR_FRICTION ** (dt * 60)
    if (Math.abs(reservoir) < 0.001) reservoir = 0

    // Exponential follow: buttery, never overshoots the reservoir.
    const rising = Math.abs(reservoir) >= Math.abs(accel.boost)
    const followRate = rising ? FOLLOW_ATTACK : FOLLOW_RELEASE
    const t = 1 - Math.exp(-followRate * dt)
    accel.boost += (reservoir - accel.boost) * t

    if (reservoir === 0 && Math.abs(accel.boost) < 0.001) accel.boost = 0

    getArchiveMarqueeInners().forEach(syncInnerRate)
  }

  window.addEventListener('wheel', onWheel, { passive: true })
  gsap.ticker.add(update)

  return () => {
    window.removeEventListener('wheel', onWheel)
    gsap.ticker.remove(update)
    reservoir = 0
    accel.boost = 0
    getArchiveMarqueeInners().forEach(syncInnerRate)
  }
}
