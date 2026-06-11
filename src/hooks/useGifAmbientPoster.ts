import { useEffect } from 'react'

/** Full-page blurred poster on `html` / `body` while the GIF tool is active. */
export function useGifAmbientPoster(posterUrl: string | null) {
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    if (posterUrl) {
      root.style.setProperty('--gif-ambient-image', `url("${posterUrl}")`)
      root.classList.add('gif-tool-ambient')
      body.classList.add('gif-tool-ambient')
    } else {
      root.style.removeProperty('--gif-ambient-image')
      root.classList.remove('gif-tool-ambient')
      body.classList.remove('gif-tool-ambient')
    }

    return () => {
      root.style.removeProperty('--gif-ambient-image')
      root.classList.remove('gif-tool-ambient')
      body.classList.remove('gif-tool-ambient')
    }
  }, [posterUrl])
}
