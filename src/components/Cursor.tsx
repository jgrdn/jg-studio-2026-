import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'
import { LenisContext } from './SmoothScroll'

const DOT = 8
/** Plain links + menu chrome — enlarged dot, no label */
const SPOT = 28

type Variant = 'dot' | 'spot' | 'pill' | 'icon' | 'preview'

type CursorState = {
  variant: Variant
  label?: string
  previewBg?: string
}

function isCursorUiElement(el: Element): boolean {
  return Boolean(el.closest('.cursor'))
}

function resolveCursor(el: EventTarget | null): CursorState | null {
  if (!(el instanceof Element)) return null
  if (isCursorUiElement(el)) return null

  const cursorEl = el.closest<HTMLElement>('[data-cursor-variant]')
  if (cursorEl) {
    const variant = cursorEl.dataset.cursorVariant as Variant | undefined
    if (!variant) return null
    return {
      variant,
      label: cursorEl.dataset.cursorLabel,
      previewBg: cursorEl.dataset.cursorPreviewBg,
    }
  }

  const linkEl = el.closest<HTMLElement>('a[href]')
  if (linkEl) {
    const href = linkEl.getAttribute('href') ?? ''
    if (href && !href.toLowerCase().startsWith('javascript:')) {
      return { variant: 'spot' }
    }
  }

  return null
}

function sameState(a: CursorState, b: CursorState): boolean {
  return (
    a.variant === b.variant &&
    a.label === b.label &&
    a.previewBg === b.previewBg
  )
}

function stackAtPoint(x: number, y: number, outer: HTMLElement | null, hideCursorOverlay: boolean) {
  if (!hideCursorOverlay || !outer) return document.elementsFromPoint(x, y)

  const prevVisibility = outer.style.visibility
  outer.style.visibility = 'hidden'
  const stack = document.elementsFromPoint(x, y)
  if (prevVisibility) outer.style.visibility = prevVisibility
  else outer.style.removeProperty('visibility')
  return stack
}

function resolveFromStack(stack: Element[]): CursorState | null {
  for (const el of stack) {
    if (!(el instanceof Element) || isCursorUiElement(el)) continue
    const resolved = resolveCursor(el)
    if (resolved) return resolved
  }
  return null
}

function resolveCursorAtPoint(x: number, y: number, outer: HTMLElement | null): CursorState {
  const direct =
    resolveFromStack(stackAtPoint(x, y, outer, false)) ??
    resolveFromStack(stackAtPoint(x, y, outer, true))
  return direct ?? { variant: 'dot' }
}

/** Title case per word; keeps spacing and symbols like × intact */
function toTitleCase(input: string): string {
  return input
    .split(/(\s+)/)
    .map((segment) => {
      if (/^\s+$/.test(segment)) return segment
      if (segment.length === 0) return segment
      const first = segment.charAt(0)
      const rest = segment.slice(1).toLowerCase()
      return first.toUpperCase() + rest
    })
    .join('')
}

function usePreviewTilePx() {
  const [px, setPx] = useState(96)
  useEffect(() => {
    const update = () =>
      setPx(Math.min(112, Math.max(72, Math.round(window.innerWidth * 0.11))))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return px
}

export function Cursor() {
  const lenis = useContext(LenisContext)
  const prefersReducedMotion = usePrefersReducedMotion()
  const previewTilePx = usePreviewTilePx()
  const outerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const prevBlendKeyRef = useRef<number | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const smoothRef = useRef({ x: 0, y: 0 })
  const initialisedRef = useRef(false)
  const inViewportRef = useRef(false)
  const enterHitTestTimerRef = useRef<number | null>(null)
  const enterProbeRafRef = useRef<number | null>(null)
  const prevVariantRef = useRef<Variant>('dot')
  const [state, setState] = useState<CursorState>({ variant: 'dot' })
  const [inViewport, setInViewport] = useState(false)
  const [pillBox, setPillBox] = useState({ w: DOT, h: DOT })

  const rawLabel = state.label ?? ''
  const previewBg = state.previewBg ?? ''
  const variant = state.variant

  const displayLabel =
    variant === 'icon' || !rawLabel ? rawLabel : toTitleCase(rawLabel)

  const blendDifference = variant === 'dot' || variant === 'spot'
  const blendKey = blendDifference ? 1 : 0

  useEffect(() => {
    if (prefersReducedMotion) {
      prevBlendKeyRef.current = blendKey
      return
    }
    if (prevBlendKeyRef.current === null) {
      prevBlendKeyRef.current = blendKey
      return
    }
    if (prevBlendKeyRef.current === blendKey) return
    prevBlendKeyRef.current = blendKey

    const el = outerRef.current
    if (!el?.animate) return

    el.animate([{ opacity: 0.91 }, { opacity: 1 }], {
      duration: 260,
      easing: 'cubic-bezier(0.33, 1, 0.53, 1)',
      fill: 'forwards',
    })
  }, [blendKey, prefersReducedMotion])

  useLayoutEffect(() => {
    const wasPill = prevVariantRef.current === 'pill'
    prevVariantRef.current = variant

    if (variant !== 'pill' || !rawLabel) {
      setPillBox({ w: DOT, h: DOT })
      return
    }

    const el = measureRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const next = {
      w: Math.max(DOT, Math.ceil(r.width)),
      h: Math.max(DOT, Math.ceil(r.height)),
    }

    /* Paint dot-sized pill once before expanding so width/height/padding transitions ease from t=0 */
    if (!wasPill) {
      setPillBox({ w: DOT, h: DOT })
      requestAnimationFrame(() => {
        setPillBox(next)
      })
      return
    }

    setPillBox(next)
  }, [variant, rawLabel])

  useLayoutEffect(() => {
    if (!inViewport) return
    const { x, y } = targetRef.current
    setState(resolveCursorAtPoint(x, y, outerRef.current))
  }, [inViewport])

  const blob = useMemo(() => {
    switch (variant) {
      case 'dot':
        return { w: DOT, h: DOT }
      case 'spot':
        return { w: SPOT, h: SPOT }
      case 'pill': {
        const w = pillBox.w
        const h = pillBox.h
        return { w, h }
      }
      case 'icon':
        return { w: 42, h: 42 }
      case 'preview': {
        const s = previewTilePx
        return { w: s, h: s }
      }
      default:
        return { w: DOT, h: DOT }
    }
  }, [variant, pillBox.w, pillBox.h, previewTilePx])

  const className = useMemo(() => {
    const parts = [
      'cursor',
      blendDifference ? 'cursor--difference' : 'cursor--no-blend',
      `cursor--${variant}`,
      rawLabel ? 'cursor--has-label' : '',
      inViewport ? '' : 'cursor--viewport-out',
      prefersReducedMotion ? 'cursor--reduce-motion' : '',
    ]
    return parts.filter(Boolean).join(' ')
  }, [variant, rawLabel, inViewport, prefersReducedMotion, blendDifference])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const lerpFactor = prefersReducedMotion ? 1 : 0.22

    const snapTo = (x: number, y: number) => {
      targetRef.current.x = x
      targetRef.current.y = y
      smoothRef.current.x = x
      smoothRef.current.y = y
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      initialisedRef.current = true
    }

    const applyCursorAt = (x: number, y: number, force = false) => {
      const next = resolveCursorAtPoint(x, y, outerRef.current)
      setState((prev) => (force || !sameState(prev, next) ? next : prev))
    }

    const cancelEnterProbe = () => {
      if (enterProbeRafRef.current != null) {
        window.cancelAnimationFrame(enterProbeRafRef.current)
        enterProbeRafRef.current = null
      }
      if (enterHitTestTimerRef.current != null) {
        window.clearTimeout(enterHitTestTimerRef.current)
        enterHitTestTimerRef.current = null
      }
    }

    const scheduleEnterHitTest = (x: number, y: number) => {
      cancelEnterProbe()

      let frame = 0
      const probe = () => {
        if (!inViewportRef.current) return
        applyCursorAt(x, y, frame < 22)
        frame += 1
        if (frame < 22) enterProbeRafRef.current = window.requestAnimationFrame(probe)
        else enterProbeRafRef.current = null
      }
      applyCursorAt(x, y, true)
      enterProbeRafRef.current = window.requestAnimationFrame(probe)

      enterHitTestTimerRef.current = window.setTimeout(() => {
        enterHitTestTimerRef.current = null
        applyCursorAt(x, y, true)
      }, 360)
    }

    const enterViewport = (x: number, y: number) => {
      snapTo(x, y)
      inViewportRef.current = true
      setInViewport(true)
      scheduleEnterHitTest(x, y)
    }

    const leaveViewport = () => {
      cancelEnterProbe()
      inViewportRef.current = false
      setInViewport(false)
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const refreshCursorFromPoint = () => {
      const { x, y } = targetRef.current
      applyCursorAt(x, y)
    }

    let scrollRefreshRaf: number | null = null
    const onScroll = () => {
      if (!inViewportRef.current) return
      if (scrollRefreshRaf != null) return
      scrollRefreshRaf = window.requestAnimationFrame(() => {
        scrollRefreshRaf = null
        refreshCursorFromPoint()
      })
    }

    const refreshCursorFromActiveElement = () => {
      const el = document.activeElement
      const next = resolveCursor(el) ?? { variant: 'dot' as const }
      setState((prev) => (sameState(prev, next) ? prev : next))
    }

    const tick = () => {
      rafRef.current = null
      if (!inViewportRef.current) return

      const target = targetRef.current
      const smooth = smoothRef.current

      smooth.x += (target.x - smooth.x) * lerpFactor
      smooth.y += (target.y - smooth.y) * lerpFactor

      root.style.transform = `translate3d(${smooth.x}px, ${smooth.y}px, 0)`

      const dx = target.x - smooth.x
      const dy = target.y - smooth.y
      if (!prefersReducedMotion && dx * dx + dy * dy > 0.04) {
        rafRef.current = window.requestAnimationFrame(tick)
      }
    }

    const scheduleTick = () => {
      if (rafRef.current == null) rafRef.current = window.requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return

      if (!inViewportRef.current) {
        enterViewport(e.clientX, e.clientY)
      }

      targetRef.current.x = e.clientX
      targetRef.current.y = e.clientY
      scheduleTick()

      applyCursorAt(e.clientX, e.clientY)
    }

    const onEnterWindow = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      enterViewport(e.clientX, e.clientY)
    }

    const onOverWindow = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || inViewportRef.current) return
      const rel = e.relatedTarget
      const fromOutside =
        rel === null || (rel instanceof Node && !document.documentElement.contains(rel))
      if (!fromOutside) return
      enterViewport(e.clientX, e.clientY)
    }

    const onLeaveWindow = (e: PointerEvent) => {
      if (e.relatedTarget === null && e.pointerType === 'mouse') {
        leaveViewport()
      }
    }

    const onDown = () => {
      root.parentElement?.classList.add('is-down')
      // Clicking without moving should still refresh labels (e.g. play/pause on hero video).
      window.requestAnimationFrame(refreshCursorFromPoint)
    }

    const onUp = () => {
      root.parentElement?.classList.remove('is-down')
      // The underlying element's data attributes may update after the action completes.
      window.requestAnimationFrame(refreshCursorFromPoint)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      window.requestAnimationFrame(refreshCursorFromActiveElement)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerenter', onEnterWindow)
    document.documentElement.addEventListener('pointerover', onOverWindow)
    document.documentElement.addEventListener('pointerout', onLeaveWindow)
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    const onWindowBlur = () => {
      onUp()
      leaveViewport()
    }

    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    lenis?.on('scroll', onScroll)

    const anchor = anchorRef.current
    const onAnchorTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform' || !inViewportRef.current) return
      applyCursorAt(targetRef.current.x, targetRef.current.y, true)
    }
    anchor?.addEventListener('transitionend', onAnchorTransitionEnd)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerenter', onEnterWindow)
      document.documentElement.removeEventListener('pointerover', onOverWindow)
      document.documentElement.removeEventListener('pointerout', onLeaveWindow)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('blur', onWindowBlur)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('scroll', onScroll, { capture: true })
      lenis?.off('scroll', onScroll)
      anchor?.removeEventListener('transitionend', onAnchorTransitionEnd)
      if (scrollRefreshRaf != null) {
        window.cancelAnimationFrame(scrollRefreshRaf)
        scrollRefreshRaf = null
      }
      cancelEnterProbe()
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [prefersReducedMotion, lenis])

  const stack = (
    <div className="cursor__stack">
      <span ref={measureRef} className="cursor__measure cursor__measure--pill" aria-hidden>
        {variant === 'pill' && rawLabel ? displayLabel : '\u00a0'}
      </span>
      <div
        className={`cursor__blob cursor__blob--${variant}`}
        style={{
          width: blob.w,
          height: blob.h,
        }}
      >
        {variant === 'preview' && previewBg ? (
          <span
            className="cursor__blob-media"
            style={{
              background: previewBg,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : null}
        {(variant === 'pill' || variant === 'icon') && rawLabel ? (
          <span className="cursor__blob-label">{displayLabel}</span>
        ) : null}
      </div>
      {variant === 'preview' && rawLabel ? (
        <div className="cursor__caption">{toTitleCase(rawLabel)}</div>
      ) : null}
    </div>
  )

  const content = (
    <div ref={outerRef} className={className} aria-hidden="true">
      <div ref={rootRef} className="cursor__inner">
        <div ref={anchorRef} className="cursor__anchor">
          {stack}
        </div>
      </div>
    </div>
  )

  // Portal to <body> so the cursor escapes the app's stacking context and
  // always paints above overlays (e.g. the archive image viewer).
  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}
