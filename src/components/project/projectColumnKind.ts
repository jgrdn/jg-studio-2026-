import type { ProjectBlock } from '../../content/projects/types'

const MEDIA_TYPES = new Set<ProjectBlock['type']>([
  'fullWidthMedia',
  'carousel',
  'masonry',
  'twoUp',
])

export type ProjectColumnKind = 'text' | 'media' | 'mixed'

export function projectColumnKind(blocks: ProjectBlock[]): ProjectColumnKind {
  const hasText = blocks.some((b) => b.type === 'richText')
  const hasMedia = blocks.some((b) => MEDIA_TYPES.has(b.type))
  if (hasText && !hasMedia) return 'text'
  if (hasMedia && !hasText) return 'media'
  return 'mixed'
}

export function projectColumnClass(kind: ProjectColumnKind): string {
  if (kind === 'text') return 'project-col--text'
  if (kind === 'media') return 'project-col--media'
  return 'project-col--mixed'
}
