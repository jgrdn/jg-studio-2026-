import type { MediaItem } from '../../content/projects/types'
import { renderMediaItem } from './renderMediaItem'

function itemKey(item: MediaItem, i: number) {
  if (item.kind === 'fill') return `fill-${i}-${item.gradient.slice(0, 24)}`
  return item.src
}

export function ProjectMasonry({ items }: { items: MediaItem[] }) {
  return (
    <section className="project-block project-masonry" aria-label="Gallery">
      <div className="grid-12">
        <div className="span-12 project-masonry__cols">
          {items.length ? (
            items.map((item, i) => (
              <div key={itemKey(item, i)} className="project-masonry__tile">
                {renderMediaItem(item, 'project-masonry__item')}
              </div>
            ))
          ) : (
            <div className="project-masonry__empty">Gallery content coming soon.</div>
          )}
        </div>
      </div>
    </section>
  )
}
