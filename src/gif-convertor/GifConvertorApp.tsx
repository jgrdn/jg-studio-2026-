import { useEffect } from 'react'
import { GifConvertorPage } from './GifConvertorPage'

export function GifConvertorApp() {
  useEffect(() => {
    document.documentElement.classList.add('gif-tool-root')
    document.body.classList.add('gif-tool-page')
    return () => {
      document.documentElement.classList.remove('gif-tool-root')
      document.body.classList.remove('gif-tool-page')
    }
  }, [])

  return <GifConvertorPage />
}
