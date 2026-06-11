/** Production custom domain — gifmaker.jg.studio */
export const GIF_MAKER_SUBDOMAIN = 'gifmaker'
export const GIF_MAKER_ORIGIN = 'https://gifmaker.jg.studio'

/** Older hostname; still recognised so nothing breaks during DNS cutover. */
const LEGACY_GIF_MAKER_SUBDOMAINS = ['gif-convertor'] as const

const GIF_MAKER_SUBDOMAINS = [GIF_MAKER_SUBDOMAIN, ...LEGACY_GIF_MAKER_SUBDOMAINS] as const

function hostMatchesGifMakerSlug(host: string, slug: string): boolean {
  return host === slug || host.startsWith(`${slug}.`)
}

export function isGifMakerHost(hostname?: string): boolean {
  const host = (hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase()
  if (!host) return false
  return GIF_MAKER_SUBDOMAINS.some((slug) => hostMatchesGifMakerSlug(host, slug))
}

/** @deprecated Use {@link isGifMakerHost} */
export const isGifConvertorHost = isGifMakerHost

/** @deprecated Use {@link GIF_MAKER_SUBDOMAIN} */
export const GIF_CONVERTOR_SUBDOMAIN = GIF_MAKER_SUBDOMAIN

const DEV_GIF_MAKER_PATHS = ['/gifmaker', '/gif-convertor'] as const

function isDevGifMakerPath(pathname: string): boolean {
  return DEV_GIF_MAKER_PATHS.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  )
}

/** Set `VITE_GIF_MAKER_ONLY=true` on a Vercel project that only hosts the tool. */
export function isGifMakerOnlyDeploy(): boolean {
  return import.meta.env.VITE_GIF_MAKER_ONLY === 'true'
}

/** Custom domain in prod; `/gifmaker` or `/gif-convertor` in local dev. */
export function isGifConvertorContext(pathname?: string, hostname?: string): boolean {
  if (isGifMakerOnlyDeploy()) return true
  if (isGifMakerHost(hostname)) return true
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '')
  return import.meta.env.DEV && isDevGifMakerPath(path)
}
