import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

const FILTER_FADE_IN = 0.38

function gridItems(grid: HTMLUListElement) {
  return Array.from(grid.querySelectorAll<HTMLElement>(':scope > li'))
}

function projectItems(items: HTMLElement[]) {
  return items.filter((item) => !item.hasAttribute('data-work-cta'))
}

function slugFromLi(li: HTMLElement): string | null {
  const link = li.querySelector<HTMLElement>('a[href^="/work/"]')
  const href = link?.getAttribute('href')
  if (!href) return null
  return href.replace(/^\/work\//, '')
}

/** Smooth work grid updates — CSS handles layout resize; JS only softens filter changes. */
export function useWorkFilterMotion(
  gridRef: RefObject<HTMLUListElement | null>,
  keys: { layoutKey: string; filterKey: string },
) {
  const reduced = usePrefersReducedMotion()
  const skipFirst = useRef(true)
  const prevKeys = useRef(keys)
  const prevSlugs = useRef<string[]>([])

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const items = gridItems(grid)
    const projects = projectItems(items)
    const slugs = projects.map((li) => slugFromLi(li)).filter(Boolean) as string[]

    if (skipFirst.current) {
      skipFirst.current = false
      prevKeys.current = keys
      prevSlugs.current = slugs
      return
    }

    const layoutChanged = prevKeys.current.layoutKey !== keys.layoutKey
    const filterChanged = prevKeys.current.filterKey !== keys.filterKey
    prevKeys.current = keys

    if (reduced) {
      prevSlugs.current = slugs
      return
    }

    gsap.killTweensOf(grid)
    gsap.killTweensOf(projects)

    if (layoutChanged) {
      grid.dataset.workLayoutAnim = '1'
      gsap.fromTo(
        grid,
        { opacity: 0.92 },
        {
          opacity: 1,
          duration: 0.44,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: () => {
            delete grid.dataset.workLayoutAnim
          },
        },
      )
    }

    if (filterChanged) {
      const entering = projects.filter((li) => {
        const slug = slugFromLi(li)
        return slug && !prevSlugs.current.includes(slug)
      })

      if (entering.length) {
        gsap.fromTo(
          entering,
          { opacity: 0 },
          {
            opacity: 1,
            duration: FILTER_FADE_IN,
            stagger: 0.022,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'opacity',
          },
        )
      }
    }

    prevSlugs.current = slugs
  }, [keys.filterKey, keys.layoutKey, reduced, gridRef])
}
