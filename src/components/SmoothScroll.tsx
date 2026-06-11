import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'

type Props = {
  children: ReactNode
}

/** Lenis instance when smooth scrolling is active; null on coarse pointers / reduced motion. */
export const LenisContext = createContext<Lenis | null>(null)

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

export function SmoothScroll({ children }: Props) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const isFinePointer =
      window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? false
    if (!isFinePointer) return
    if (prefersReducedMotion()) return

    const instance = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      lerp: 0.09,
    })

    setLenis(instance)

    const raf = (time: number) => {
      instance.raf(time)
      rafRef.current = window.requestAnimationFrame(raf)
    }
    rafRef.current = window.requestAnimationFrame(raf)

    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
