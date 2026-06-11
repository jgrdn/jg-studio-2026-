import { useContext, useEffect, useState, type RefObject } from 'react'
import { LenisContext } from '../components/SmoothScroll'

/** True while the work section overlaps the viewport (Lenis-aware). */
export function useWorkSectionActive(ref: RefObject<HTMLElement | null>) {
  const lenis = useContext(LenisContext)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const update = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      setActive(rect.bottom > 64 && rect.top < vh - 48)
    }

    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        update()
      })
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    lenis?.on('scroll', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      lenis?.off('scroll', schedule)
      cancelAnimationFrame(raf)
    }
  }, [ref, lenis])

  return active
}
