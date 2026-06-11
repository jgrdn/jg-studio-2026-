import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { GA_MEASUREMENT_ID } from '../content/site'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Sends GA4 page_view on client-side route changes (initial load handled in index.html). */
export function GoogleAnalytics() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return
    const pagePath = `${pathname}${search}`
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
    })
  }, [pathname, search])

  return null
}
