import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useProjectCardHoverMotion } from '../hooks/useProjectCardHoverMotion'
import { useWorkFilterMotion } from '../hooks/useWorkFilterMotion'
import { useWorkSectionActive } from '../hooks/useWorkSectionActive'
import { projects } from '../content/site'
import {
  gridSpanClass,
  projectMatchesFilters,
  type WorkColumns,
  type WorkRatio,
  type WorkType,
} from '../content/workFilters'
import { Link } from 'react-router-dom'
import { ProjectCardMedia, useProjectCardVideoHover } from './ProjectCardMedia'
import { WorkControls } from './WorkControls'
import { WorkCtaCard } from './WorkCtaCard'

function WorkProjectCard({
  project,
}: {
  project: (typeof projects)[number]
}) {
  const { videoRef, onMouseEnter, onMouseLeave } = useProjectCardVideoHover(project.thumbnailVideo)
  const cardStyle = project.thumbnailVideo
    ? undefined
    : ({ '--card-media': project.media } as CSSProperties)
  const hoverHandlers = project.thumbnailVideo
    ? { onMouseEnter, onMouseLeave }
    : {}

  const body = (
    <>
      <ProjectCardMedia
        videoRef={videoRef}
        videoSrc={project.thumbnailVideo}
        media={project.media}
      />
      <ul className="project-card__tags" role="list">
        {project.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="project-card__bottom">
        <div className="project-card__text">
          <h3>{project.title}</h3>
          <p>{project.subtitle}</p>
        </div>
      </div>
    </>
  )

  if (project.status === 'coming-soon') {
    return (
      <div
        className="project-card is-soon"
        style={cardStyle}
        data-cursor-variant="pill"
        data-cursor-label="Coming soon"
        aria-label={`${project.title}. Coming soon.`}
        {...hoverHandlers}
      >
        {body}
      </div>
    )
  }

  return (
    <Link
      className="project-card"
      to={`/work/${project.slug}`}
      style={cardStyle}
      data-cursor-variant="pill"
      data-cursor-label="View project"
      aria-label={`${project.title}: ${project.subtitle}`}
      {...hoverHandlers}
    >
      {body}
    </Link>
  )
}

export function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLUListElement>(null)
  useProjectCardHoverMotion(gridRef)

  const [columns, setColumns] = useState<WorkColumns>(3)
  const [ratio, setRatio] = useState<WorkRatio>('4-5')
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const sectionActive = useWorkSectionActive(sectionRef)
  const hasFilters = workTypes.length > 0
  const controlsVisible = sectionActive || hasFilters || filtersOpen

  const filteredProjects = useMemo(
    () => projects.filter((p) => projectMatchesFilters(p.slug, workTypes)),
    [workTypes],
  )

  const layoutKey = `${columns}|${ratio}`
  const filterKey = workTypes.join(',')
  useWorkFilterMotion(gridRef, { layoutKey, filterKey })

  const spanClass = gridSpanClass(columns)

  return (
    <>
      <WorkControls
        visible={controlsVisible}
        columns={columns}
        ratio={ratio}
        workTypes={workTypes}
        filtersOpen={filtersOpen}
        onFiltersOpenChange={setFiltersOpen}
        onColumnsChange={setColumns}
        onRatioChange={setRatio}
        onWorkTypesChange={setWorkTypes}
      />

      <section
        ref={sectionRef}
        className="work-section"
        id="work"
        aria-label="Selected work"
        data-work-cols={columns}
        data-work-ratio={ratio}
      >
        <div className="grid-12 work-section__grid">
          <ul ref={gridRef} className="project-grid-ul" role="list">
            {filteredProjects.map((project) => (
              <li key={project.slug} className={spanClass}>
                <WorkProjectCard project={project} />
              </li>
            ))}

            <li className={spanClass} data-work-cta>
              <WorkCtaCard />
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
