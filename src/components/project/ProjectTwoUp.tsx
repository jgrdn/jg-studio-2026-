import type { MediaItem } from '../../content/projects/types'
import { renderMediaItem } from './renderMediaItem'

export function ProjectTwoUp({ left, right }: { left: MediaItem; right: MediaItem }) {
  return (
    <div className="project-two-up-bleed">
      <section className="project-block project-two-up project-two-up--bleed" aria-label="Image pair">
        <div className="project-two-up--bleed__inner">
          <div className="project-two-up__row">
            <div className="project-two-up__cell">{renderMediaItem(left, 'project-media__el')}</div>
            <div className="project-two-up__cell">{renderMediaItem(right, 'project-media__el')}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
