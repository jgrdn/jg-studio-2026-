/** Favicon + touch icon (JG mark) */
export const FAVICON = '/favicon.png'

/** Default Open Graph / social share image (homepage + project fallback) */
export const SITE_OG_IMAGE = '/og-share.jpg'

/** Default placeholder imagery for project cards until assets are wired in */
export const DEFAULT_THUMBNAIL = '/default-thumbnail.png'

/** For CSS `background-image` (project cards, fill blocks) */
export const defaultThumbnailBg = `url("${DEFAULT_THUMBNAIL}")`

/** Project card + case-study placeholder art (served from /public/projects) */
export const PROJECT_IMAGES = {
  jaguar: '/projects/jaguar.png',
  unmind: '/projects/unmind.png',
  'bide-and-fecht': '/projects/bide-and-fecht.png',
  interflora: '/projects/interflora.png',
} as const

export function projectThumbnailBg(src: string): string {
  return `url("${src}")`
}

/** Homepage project-card hover previews */
export const PROJECT_VIDEOS = {
  'click-travel': '/projects/click-travel.mp4',
  nespresso: '/projects/nespresso.mp4',
  'auto-finesse': '/projects/auto-finesse.mp4',
  'adobe-pergraphica': '/projects/adobe-pergraphica.mp4',
} as const
