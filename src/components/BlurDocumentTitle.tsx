import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

const BLUR_TITLE_MESSAGES = [
  '👀 Still there?',
  '🔥 Heat inside!',
  '✅ Get in touch!',
] as const

const CYCLE_MS = 5000

/** Cycles playful tab titles when the window loses focus; restores the page title on return. */
export function BlurDocumentTitle() {
  const { pathname } = useLocation()
  const reduced = usePrefersReducedMotion()
  const intervalRef = useRef<number | null>(null)
  const originalTitleRef = useRef('')
  const messageIndexRef = useRef(0)

  useEffect(() => {
    if (reduced) return

    const clearCycle = () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const restoreTitle = () => {
      clearCycle()
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current
      }
    }

    const onBlur = () => {
      originalTitleRef.current = document.title
      messageIndexRef.current = 0
      clearCycle()
      intervalRef.current = window.setInterval(() => {
        document.title = BLUR_TITLE_MESSAGES[messageIndexRef.current % BLUR_TITLE_MESSAGES.length]
        messageIndexRef.current += 1
      }, CYCLE_MS)
    }

    const onFocus = () => {
      restoreTitle()
    }

    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      restoreTitle()
    }
  }, [reduced])

  useEffect(() => {
    if (reduced || !document.hasFocus()) return
    const id = requestAnimationFrame(() => {
      originalTitleRef.current = document.title
    })
    return () => window.cancelAnimationFrame(id)
  }, [pathname, reduced])

  return null
}
