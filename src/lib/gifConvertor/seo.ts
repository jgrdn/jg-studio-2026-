import { GIF_MAKER_OG_IMAGE, GIF_MAKER_ORIGIN } from './host'

export const GIF_MAKER_SITE_NAME = 'Gif Maker'

export const GIF_MAKER_TITLE = 'Gif Maker'

export const GIF_MAKER_DESCRIPTION =
  'Drop footage. Ship a GIF. Trim, crop, and tune frame rate in your browser. Your files never leave your device.'

export const GIF_MAKER_OG_ALT = 'Gif Maker — Drop footage. Ship a GIF.'

export const GIF_MAKER_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: GIF_MAKER_SITE_NAME,
  url: GIF_MAKER_ORIGIN,
  description: GIF_MAKER_DESCRIPTION,
  image: GIF_MAKER_OG_IMAGE,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
} as const

const PORTFOLIO_HEAD_MARKERS = [
  'Joey Gordon',
  'Executive Design Director',
  'https://jg.studio/og-share',
  'https://jg.studio/',
] as const

/** Remove portfolio defaults from index.html when the tool runs on a shared shell. */
export function scrubPortfolioHead(): void {
  document
    .querySelectorAll('script[src*="googletagmanager.com"], script[src*="google-analytics.com"]')
    .forEach((node) => node.remove())

  document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
    const text = node.textContent ?? ''
    if (text.includes('Joey Gordon') || text.includes('Executive Design Director')) {
      node.remove()
    }
  })

  document.querySelectorAll('meta[name], meta[property]').forEach((node) => {
    const content = node.getAttribute('content') ?? ''
    if (PORTFOLIO_HEAD_MARKERS.some((marker) => content.includes(marker))) {
      node.remove()
    }
  })

  document.querySelectorAll('link[rel="canonical"]').forEach((node) => {
    const href = node.getAttribute('href') ?? ''
    if (href.includes('jg.studio') && !href.includes('gifmaker.')) {
      node.remove()
    }
  })

  if (document.title.includes('Joey Gordon') || document.title.includes('Executive Design Director')) {
    document.title = GIF_MAKER_TITLE
  }
}
