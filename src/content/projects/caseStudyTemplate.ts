import { defaultThumbnailBg, projectThumbnailBg } from '../media'
import type { MediaAspect, MediaItem, ProjectBlock } from './types'

const defaultFill = (aspect?: MediaAspect): MediaItem => ({
  kind: 'fill',
  gradient: defaultThumbnailBg,
  ...(aspect ? { aspect } : {}),
})

const projectFill = (src: string | undefined, aspect?: MediaAspect): MediaItem => {
  if (!src) return defaultFill(aspect)
  return {
    kind: 'fill',
    gradient: projectThumbnailBg(src),
    ...(aspect ? { aspect } : {}),
  }
}

export type CaseStudySeed = {
  slug: string
  title: string
  subtitle: string
  summary: string
  tags: string[]
  media: string
  /** Image path for case-study placeholders (hero, grids, carousel, etc.) */
  thumbnailSrc?: string
  status?: 'coming-soon'
  heroHeadline?: string
}

export type AdjacentSummary = {
  slug: string
  title: string
  subtitle: string
  media: string
  thumbnailVideo?: string
  tags: string[]
  status?: 'coming-soon'
}

function masonryTiles(src?: string): MediaItem[] {
  const aspects: MediaAspect[] = ['1/1', '4/5', '16/9', '1/1', '16/9', '4/5']
  return aspects.map((aspect) => projectFill(src, aspect))
}

function carouselSlides(src?: string): MediaItem[] {
  return Array.from({ length: 8 }, () => projectFill(src, '4/5'))
}

export function caseStudyBlocks(
  seed: CaseStudySeed,
  adjacent: { prev: AdjacentSummary | null; next: AdjacentSummary | null },
): ProjectBlock[] {
  const headline = seed.heroHeadline ?? seed.title
  const meta = seed.tags.slice(0, 5)
  const subline =
    seed.heroHeadline && seed.subtitle === seed.heroHeadline
      ? seed.title
      : [seed.title, seed.subtitle].filter(Boolean).join('. ')

  const heroBody =
    seed.status === 'coming-soon'
      ? [
          seed.summary,
          'Imagery, credits, and a fuller narrative will appear here once this case is ready to publish.',
        ]
      : [seed.summary]

  const overviewBody =
    seed.status === 'coming-soon'
      ? [
          'Structure and pacing follow the studio case-study template so the page stays consistent whilst assets are prepared.',
        ]
      : [
          `Led across ${seed.tags.slice(0, 4).join(', ')}. One idea, tuned for every channel it needed to travel through.`,
        ]

  const approachBody =
    seed.status === 'coming-soon'
      ? [
          'Use this column for process, craft notes, or credits when the case goes live. The wide frame beside it is sized for a tall still or crop.',
        ]
      : [
          'Direction, design, and production craft were kept in one thread so the work stays legible in campaign, product, and retail contexts.',
        ]

  const thumb = seed.thumbnailSrc

  return [
    {
      type: 'projectHero',
      background: projectFill(thumb),
      headline,
      subline,
      body: heroBody,
      meta,
    },
    {
      type: 'twoUp',
      left: projectFill(thumb),
      right: projectFill(thumb),
    },
    {
      type: 'twoCol',
      layout: '1-2',
      left: [
        {
          type: 'richText',
          eyebrow: 'Overview',
          heading: 'Context',
          body: overviewBody,
        },
      ],
      right: [
        {
          type: 'fullWidthMedia',
          shell: 'none',
          items: [projectFill(thumb, '4/3')],
        },
      ],
    },
    {
      type: 'carousel',
      layout: 'row4',
      items: carouselSlides(thumb),
    },
    {
      type: 'twoCol',
      layout: '2-1',
      left: [
        {
          type: 'fullWidthMedia',
          shell: 'none',
          items: [projectFill(thumb, '4/3')],
        },
      ],
      right: [
        {
          type: 'richText',
          eyebrow: 'Approach',
          heading: seed.status === 'coming-soon' ? 'In progress' : 'How it came together',
          body: approachBody,
        },
      ],
    },
    {
      type: 'fullWidthMedia',
      variant: 'default',
      items: [projectFill(thumb, '16/9')],
    },
    {
      type: 'masonry',
      items: masonryTiles(thumb),
    },
    {
      type: 'adjacentProjects',
      prev: adjacent.prev,
      next: adjacent.next,
    },
  ]
}
