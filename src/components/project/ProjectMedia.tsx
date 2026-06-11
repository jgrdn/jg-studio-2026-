import type { MediaItem } from '../../content/projects/types'
import { renderMediaItem } from './renderMediaItem'

export function ProjectMedia({
  items,
  caption,
  variant = 'default',
  shell = 'grid',
}: {
  items: MediaItem[]
  caption?: string
  variant?: 'default' | 'bleed' | 'inset'
  shell?: 'grid' | 'none'
}) {
  if (!items.length) {
    return null
  }

  const inner = (
    <div className="project-media__wrap">
      {items.map((item, i) => renderMediaItem(item, 'project-media__el', String(i)))}
    </div>
  )

  const body =
    shell === 'grid' ? (
      <div className="grid-12">
        <div className="span-12">{inner}</div>
      </div>
    ) : (
      <div className="project-media__bare">{inner}</div>
    )

  return (
    <section
      className={`project-block project-media${variant === 'bleed' ? ' project-media--bleed' : ''}${variant === 'inset' ? ' project-media--inset' : ''}`}
    >
      {variant === 'bleed' ? (
        <div className="project-media__bleed-outer">{inner}</div>
      ) : (
        body
      )}
      {caption ? (
        <div className="grid-12">
          <div className="span-12 project-caption">
            <p>{caption}</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
