import type Lenis from 'lenis'
import { ScrollTrigger } from './gsapPlugins'

/** Keep ScrollTrigger in sync with Lenis smooth scroll. */
export function connectLenisScrollTrigger(lenis: Lenis): () => void {
  const onScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onScroll)

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length && typeof value === 'number') {
        lenis.scrollTo(value, { immediate: true })
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
  })

  const onRefresh = () => lenis.resize()
  ScrollTrigger.addEventListener('refresh', onRefresh)
  ScrollTrigger.refresh()

  return () => {
    lenis.off('scroll', onScroll)
    ScrollTrigger.scrollerProxy(document.documentElement, {})
    ScrollTrigger.removeEventListener('refresh', onRefresh)
  }
}
