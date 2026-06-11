export type MediaAspect = '1/1' | '4/3' | '4/5' | '16/9' | '3/2' | '21/9' | 'auto'

export type MediaItem =
  | {
      kind: 'image' | 'video'
      src: string
      alt?: string
      aspect?: MediaAspect
    }
  | {
      kind: 'fill'
      gradient: string
      aspect?: MediaAspect
    }

export type ProjectBlock =
  | {
      type: 'projectHero'
      background: MediaItem
      headline: string
      subline?: string
      /** Short lede / bio paragraphs (guttered, inside the viewport hero) */
      body?: string[]
      meta?: string[]
    }
  | {
      type: 'twoUp'
      left: MediaItem
      right: MediaItem
    }
  | {
      type: 'fullWidthMedia'
      items: MediaItem[]
      caption?: string
      /** bleed = edge-to-edge viewport; inset = wide band inside gutters */
      variant?: 'default' | 'bleed' | 'inset'
      /** `none` when already inside a padded grid column (avoids double gutters) */
      shell?: 'grid' | 'none'
    }
  | {
      type: 'twoCol'
      layout: '2-1' | '1-2' | '1-1'
      left: ProjectBlock[]
      right: ProjectBlock[]
    }
  | {
      type: 'threeCol'
      left: ProjectBlock[]
      middle: ProjectBlock[]
      right: ProjectBlock[]
    }
  | {
      type: 'adjacentProjects'
      prev: {
        slug: string
        title: string
        subtitle: string
        media: string
        tags: string[]
        status?: 'coming-soon'
      } | null
      next: {
        slug: string
        title: string
        subtitle: string
        media: string
        tags: string[]
        status?: 'coming-soon'
      } | null
    }
  | {
      type: 'carousel'
      items: MediaItem[]
      /** row4 = four 4:5 cards visible; default = horizontal strip */
      layout?: 'default' | 'row4'
    }
  | {
      type: 'richText'
      eyebrow?: string
      heading?: string
      body: string[]
    }
  | {
      type: 'masonry'
      items: MediaItem[]
    }

