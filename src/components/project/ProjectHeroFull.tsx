import type { MediaItem } from '../../content/projects/types'
import { renderMediaItem } from './renderMediaItem'

export function ProjectHeroFull({
  background,
  headline,
  subline,
  body,
  meta,
}: {
  background: MediaItem
  headline: string
  subline?: string
  body?: string[]
  meta?: string[]
}) {
  return (
    <div className="project-hero-fw-wrap grid-12">
      <div className="span-12">
        <section className="project-block project-hero-fw project-hero-fw--card" aria-label="Project hero">
          <div className="project-hero-fw__bg">{renderMediaItem(background, 'project-hero-fw__bg-el')}</div>
          <div className="project-hero-fw__scrim" aria-hidden />
          <div className="project-hero-fw__shell">
            <div className="project-hero-fw__inner">
              <div className="project-hero-fw__copy">
                <h1 className="project-hero-fw__headline">{headline}</h1>
                {subline ? <p className="project-hero-fw__subline">{subline}</p> : null}
                {body?.length
                  ? body.map((p, i) => (
                      <p key={i} className="project-hero-fw__bio">
                        {p}
                      </p>
                    ))
                  : null}
              </div>
              {meta?.length ? (
                <ul className="project-hero-fw__meta" aria-label="Project tags">
                  {meta.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
