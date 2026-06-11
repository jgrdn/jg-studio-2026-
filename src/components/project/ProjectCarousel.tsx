import type { MediaItem } from '../../content/projects/types'
import { renderMediaItem } from './renderMediaItem'

function itemKey(item: MediaItem, i: number) {
  if (item.kind === 'fill') return `fill-${i}-${item.gradient.slice(0, 24)}`
  return item.src
}

export function ProjectCarousel({
  items,
  layout = 'default',
}: {
  items: MediaItem[]
  layout?: 'default' | 'row4'
}) {
  const isRow4 = layout === 'row4'
  const loopItems = items.length ? [...items, ...items] : []

  return (
    <section
      className={`project-block project-carousel${isRow4 ? ' project-carousel--row4' : ''}`}
      aria-label="Carousel"
    >
      <div className="grid-12">
        <div className="span-12">
          {isRow4 ? (
            <div className="project-carousel__marquee" role="list">
              <div className="project-carousel__marquee-inner">
                {loopItems.length ? (
                  loopItems.map((item, i) => (
                    <div
                      key={`${itemKey(item, i % items.length)}-${i}`}
                      className="project-carousel__marquee-slide"
                      role="listitem"
                    >
                      {renderMediaItem(item, 'project-carousel__el')}
                    </div>
                  ))
                ) : (
                  <div className="project-carousel__marquee-slide project-carousel__slide--empty" role="listitem">
                    <div className="project-carousel__empty">Carousel content coming soon.</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="project-carousel__track project-carousel__track--strip" role="list">
              {items.length ? (
                items.map((item, i) => (
                  <div key={itemKey(item, i)} className="project-carousel__slide" role="listitem">
                    {renderMediaItem(item, 'project-carousel__el')}
                  </div>
                ))
              ) : (
                <div className="project-carousel__slide project-carousel__slide--empty" role="listitem">
                  <div className="project-carousel__empty">Carousel content coming soon.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
