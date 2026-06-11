import { useRef, type CSSProperties } from 'react'
import { useProjectCardHoverMotion } from '../../hooks/useProjectCardHoverMotion'
import { Link } from 'react-router-dom'
import { ProjectCardMedia, useProjectCardVideoHover } from '../ProjectCardMedia'
import { WorkCtaCard } from '../WorkCtaCard'

type Card = {
  slug: string
  title: string
  subtitle: string
  media: string
  thumbnailVideo?: string
  tags: string[]
  status?: 'coming-soon'
}

function adjacentCardClass(direction: 'prev' | 'next') {
  return `project-card project-card--adjacent project-card--adjacent-${direction}`
}

function AdjacentCard({
  card,
  direction,
  navLabel,
  href,
}: {
  card: Card
  direction: 'prev' | 'next'
  navLabel: string
  href: string
}) {
  const { videoRef, onMouseEnter, onMouseLeave } = useProjectCardVideoHover(card.thumbnailVideo)
  const style = card.thumbnailVideo
    ? undefined
    : ({ '--card-media': card.media } as CSSProperties)
  const className = adjacentCardClass(direction)
  const cursorLabel = direction === 'prev' ? 'Previous project' : 'Next project'
  const hoverHandlers = card.thumbnailVideo ? { onMouseEnter, onMouseLeave } : {}

  const inner = (
    <>
      <ProjectCardMedia
        videoRef={videoRef}
        videoSrc={card.thumbnailVideo}
        media={card.media}
      />
      <span className="project-card__nav-label">{navLabel}</span>
      <div className="project-card__bottom">
        <div className="project-card__text">
          <h3>{card.title}</h3>
          <p>{card.subtitle}</p>
        </div>
      </div>
    </>
  )

  if (card.status === 'coming-soon') {
    return (
      <div
        className={`${className} is-soon`}
        style={style}
        data-cursor-variant="pill"
        data-cursor-label="Coming soon"
        aria-label={`${card.title}. Coming soon.`}
        {...hoverHandlers}
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      className={className}
      to={href}
      style={style}
      data-cursor-variant="pill"
      data-cursor-label={cursorLabel}
      aria-label={`${card.title}: ${card.subtitle}`}
      {...hoverHandlers}
    >
      {inner}
    </Link>
  )
}

export function ProjectAdjacentCards({ prev, next }: { prev: Card | null; next: Card | null }) {
  const gridRef = useRef<HTMLDivElement>(null)
  useProjectCardHoverMotion(gridRef)

  if (!prev && !next) return null

  return (
    <section className="project-block project-adjacent" aria-label="Previous project, contact, and next project">
      <div className="grid-12">
        <div ref={gridRef} className="span-12 project-adjacent__grid">
          {prev ? (
            <AdjacentCard
              card={prev}
              direction="prev"
              navLabel="Previous"
              href={`/work/${prev.slug}`}
            />
          ) : (
            <div className="project-adjacent__spacer" aria-hidden />
          )}
          <WorkCtaCard variant="adjacent" />
          {next ? (
            <AdjacentCard
              card={next}
              direction="next"
              navLabel="Next"
              href={`/work/${next.slug}`}
            />
          ) : (
            <div className="project-adjacent__spacer" aria-hidden />
          )}
        </div>
      </div>
    </section>
  )
}
