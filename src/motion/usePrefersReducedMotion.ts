import { useEffect, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
  )
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return

    const update = () => setReduced(prefersReducedMotion())
    update()

    // Safari: addListener/removeListener fallback
    const modern = (mq as MediaQueryList).addEventListener
    if (typeof modern === 'function') {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }

    const legacyAdd = (mq as unknown as { addListener?: (cb: () => void) => void }).addListener
    const legacyRemove = (mq as unknown as { removeListener?: (cb: () => void) => void }).removeListener
    legacyAdd?.(update)
    return () => legacyRemove?.(update)
  }, [])

  return reduced
}

