import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { rampArchiveMarquees } from '../../motion/archiveMarqueeMotion'
import { usePrefersReducedMotion } from '../../motion/usePrefersReducedMotion'

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

const TILE_OPACITY = 0.95
const TILE_FILTER = 'saturate(0.98) contrast(1.02)'

type Props = {
  media: string
  aspect: string
  originEl: HTMLButtonElement
  onClose: () => void
}

function parseAspectRatio(aspect: string): number {
  const [w, h] = aspect.split('/').map((s) => parseFloat(s.trim()))
  if (!w || !h) return 4 / 5
  return w / h
}

function extractUrl(bg: string): string | null {
  const match = bg.match(/url\(\s*["']?(.*?)["']?\s*\)/i)
  return match?.[1] ?? null
}

function computeExpandedRect(ratio: number, natural?: { w: number; h: number }): Rect {
  const maxW = Math.min(window.innerWidth * 0.92, natural?.w ?? Infinity, 1280)
  const maxH = Math.min(window.innerHeight * 0.88, natural?.h ?? Infinity)
  let width = maxW
  let height = width / ratio
  if (height > maxH) {
    height = maxH
    width = height * ratio
  }
  return {
    width,
    height,
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
  }
}

function lockToExpandedRect(el: HTMLElement, rect: Rect) {
  gsap.set(el, {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    margin: 0,
    zIndex: 355,
    transformOrigin: 'center center',
  })
}

function flipTransform(from: Rect, to: Rect) {
  const scale = to.width === 0 ? 1 : from.width / to.width
  const x = from.left + from.width / 2 - (to.left + to.width / 2)
  const y = from.top + from.height / 2 - (to.top + to.height / 2)
  return { x, y, scale }
}

function readElementRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
  }
}

/** Holds the column slot while the real tile is position:fixed and expanded. */
function insertSpacer(origin: HTMLButtonElement): HTMLDivElement {
  const spacer = document.createElement('div')
  spacer.className = 'archive-wall__tile-spacer'
  spacer.setAttribute('aria-hidden', 'true')
  const ratio = getComputedStyle(origin).aspectRatio
  if (ratio && ratio !== 'auto') spacer.style.aspectRatio = ratio
  const tileRatio = origin.style.getPropertyValue('--tile-ratio')
  if (tileRatio) spacer.style.setProperty('--tile-ratio', tileRatio)
  origin.parentElement?.insertBefore(spacer, origin)
  return spacer
}

/** Move tile to body so fixed positioning isn't clipped by marquee transforms. */
function liftToBody(origin: HTMLButtonElement) {
  document.body.appendChild(origin)
}

function restoreToColumn(origin: HTMLButtonElement, spacer: HTMLDivElement | null) {
  if (spacer?.parentElement) {
    spacer.parentElement.insertBefore(origin, spacer)
    spacer.remove()
    return
  }
  // Fallback if spacer is missing
  origin.remove()
}

function teardownExpanded(origin: HTMLButtonElement, spacer: HTMLDivElement | null) {
  restoreToColumn(origin, spacer)
  origin.classList.remove('archive-wall__tile--expanded')
  gsap.set(origin, {
    clearProps:
      'position,top,left,width,height,margin,zIndex,transform,transformOrigin,opacity,filter,boxShadow',
  })
}

export function ArchiveImageViewer({ media, aspect, originEl, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const closeRef = useRef(onClose)
  const originRef = useRef(originEl)
  const spacerRef = useRef<HTMLDivElement | null>(null)
  const closingRef = useRef(false)
  closeRef.current = onClose
  originRef.current = originEl

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const naturalRef = useRef<{ w: number; h: number } | null>(null)
  naturalRef.current = natural

  useEffect(() => {
    const url = extractUrl(media)
    if (!url) {
      const r = parseAspectRatio(aspect)
      setNatural({ w: r, h: 1 })
      return
    }
    let cancelled = false
    const img = new Image()
    const done = () => {
      if (cancelled) return
      if (img.naturalWidth && img.naturalHeight) {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight })
      } else {
        const r = parseAspectRatio(aspect)
        setNatural({ w: r, h: 1 })
      }
    }
    img.onload = done
    img.onerror = () => {
      if (cancelled) return
      const r = parseAspectRatio(aspect)
      setNatural({ w: r, h: 1 })
    }
    img.src = url
    if (img.complete) done()
    return () => {
      cancelled = true
    }
  }, [media, aspect])

  const expandedRect = useCallback(() => {
    const n = naturalRef.current
    const ratio = n ? n.w / n.h : parseAspectRatio(aspect)
    return computeExpandedRect(ratio, n ? { w: n.w, h: n.h } : undefined)
  }, [aspect])

  const runClose = useCallback(() => {
    if (closingRef.current) return
    const root = rootRef.current
    const backdrop = backdropRef.current
    const origin = originRef.current
    const spacer = spacerRef.current
    if (!root || !backdrop || !origin || !spacer) {
      closeRef.current()
      return
    }

    closingRef.current = true

    if (reduced) {
      teardownExpanded(origin, spacer)
      spacerRef.current = null
      closeRef.current()
      rampArchiveMarquees(1, 0)
      return
    }

    const expanded = expandedRect()
    const progress = { p: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        teardownExpanded(origin, spacer)
        spacerRef.current = null
        closeRef.current()
        rampArchiveMarquees(1, 2.2)
      },
    })

    tl.to(
      progress,
      {
        p: 1,
        duration: 0.85,
        ease: 'power3.inOut',
        onUpdate: () => {
          const slot = readElementRect(spacer)
          const t = flipTransform(slot, expanded)
          gsap.set(origin, {
            x: t.x * progress.p,
            y: t.y * progress.p,
            scale: 1 + (t.scale - 1) * progress.p,
          })
        },
      },
      0,
    )
    tl.to(
      origin,
      {
        opacity: TILE_OPACITY,
        filter: TILE_FILTER,
        boxShadow: '0px 0px 0px rgba(0,0,0,0)',
        duration: 0.85,
        ease: 'power2.inOut',
      },
      0,
    )
    tl.to(backdrop, { autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' }, 0.1)
  }, [reduced, expandedRect])

  useLayoutEffect(() => {
    const root = rootRef.current
    const backdrop = backdropRef.current
    const origin = originRef.current
    if (!root || !backdrop || !origin) return

    if (!natural) {
      gsap.set(root, { autoAlpha: 0 })
      return
    }

    const slot = readElementRect(origin)
    const expanded = expandedRect()
    const spacer = insertSpacer(origin)
    spacerRef.current = spacer

    liftToBody(origin)
    origin.classList.add('archive-wall__tile--expanded')
    lockToExpandedRect(origin, expanded)
    const start = flipTransform(slot, expanded)

    if (reduced) {
      rampArchiveMarquees(0, 0)
      gsap.set(origin, { x: 0, y: 0, scale: 1, opacity: 1 })
      gsap.set(backdrop, { autoAlpha: 1 })
      gsap.set(root, { autoAlpha: 1 })
      return () => {
        if (!closingRef.current) {
          teardownExpanded(origin, spacerRef.current)
          spacerRef.current = null
        }
      }
    }

    gsap.set(origin, {
      x: start.x,
      y: start.y,
      scale: start.scale,
      opacity: TILE_OPACITY,
      filter: TILE_FILTER,
      boxShadow: '0px 0px 0px rgba(0,0,0,0)',
    })
    gsap.set(backdrop, { autoAlpha: 0 })
    gsap.set(root, { autoAlpha: 1 })

    const tl = gsap.timeline()
    requestAnimationFrame(() => rampArchiveMarquees(0, 1.9))
    tl.to(backdrop, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 0)
    tl.to(
      origin,
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'saturate(1) contrast(1)',
        boxShadow: '0px 24px 80px rgba(0,0,0,0.45)',
        duration: 0.7,
        ease: 'power3.out',
      },
      0.04,
    )

    return () => {
      if (closingRef.current) return
      tl.kill()
      gsap.killTweensOf(origin)
      gsap.killTweensOf(backdrop)
      teardownExpanded(origin, spacerRef.current)
      spacerRef.current = null
    }
  }, [media, natural, reduced, expandedRect])

  useEffect(() => {
    document.body.classList.add('is-archive-viewing')
    return () => {
      document.body.classList.remove('is-archive-viewing')
      if (!closingRef.current) {
        rampArchiveMarquees(1, 0.01)
      }
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') runClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [runClose])

  return createPortal(
    <div
      ref={rootRef}
      className="archive-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Archive image. Press Escape or click to close"
      data-cursor-variant="pill"
      data-cursor-label="Close"
      onClick={(e) => {
        if (e.target === e.currentTarget || e.target === backdropRef.current) runClose()
      }}
    >
      <div
        ref={backdropRef}
        className="archive-viewer__backdrop"
        aria-hidden
        data-cursor-variant="pill"
        data-cursor-label="Close"
      />
    </div>,
    document.body,
  )
}
