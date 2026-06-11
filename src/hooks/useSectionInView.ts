import { useEffect, useState, type RefObject } from 'react'

type Options = {
  /** Fraction of section visible before considered “in view” (0–1) */
  threshold?: number
  rootMargin?: string
}

export function useSectionInView(
  ref: RefObject<HTMLElement | null>,
  { threshold = 0.12, rootMargin = '0px 0px -12% 0px' }: Options = {},
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= threshold),
      { threshold: [0, threshold, 0.4], rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin])

  return inView
}
