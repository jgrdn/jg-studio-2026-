import { useLayoutEffect } from 'react'
import { createViewportRevealController } from '../motion/viewportReveal'
import { useMotionRefresh } from '../motion/MotionRefreshContext'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

function waitForPageContentReady(main: HTMLElement, onReady: () => void) {
  if (main.dataset.pageContent === 'ready') {
    onReady()
    return () => {}
  }

  const observer = new MutationObserver(() => {
    if (main.dataset.pageContent !== 'ready') return
    observer.disconnect()
    onReady()
  })

  observer.observe(main, { attributes: true, attributeFilter: ['data-page-content'] })
  return () => observer.disconnect()
}

/** Sitewide scroll reveals — fade in on enter, fade out on leave. */
export function ViewportReveal() {
  const { generation } = useMotionRefresh()
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    const attach = () => {
      if (cancelled) return
      cleanup = createViewportRevealController(main, { reducedMotion: reduced })
    }

    if (main.dataset.pageContent !== 'ready') {
      const stopWait = waitForPageContentReady(main, attach)
      return () => {
        cancelled = true
        stopWait()
        cleanup?.()
      }
    }

    attach()
    return () => cleanup?.()
  }, [generation, reduced])

  return null
}
