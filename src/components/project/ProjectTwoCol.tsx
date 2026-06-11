import type { ProjectBlock } from '../../content/projects/types'
import { ProjectBlockRenderer } from './ProjectBlockRenderer'
import { projectColumnClass, projectColumnKind } from './projectColumnKind'

export function ProjectTwoCol({
  layout,
  left,
  right,
}: {
  layout: '2-1' | '1-2' | '1-1'
  left: ProjectBlock[]
  right: ProjectBlock[]
}) {
  const leftClass = layout === '2-1' ? 'span-8' : layout === '1-2' ? 'span-4' : 'span-6'
  const rightClass = layout === '2-1' ? 'span-4' : layout === '1-2' ? 'span-8' : 'span-6'
  const leftKind = projectColumnKind(left)
  const rightKind = projectColumnKind(right)

  return (
    <section
      className="project-block project-two-col"
      aria-label="Two column section"
      data-viewport-reveal="off"
    >
      <div className="grid-12 grid-12--rg">
        <div
          className={`${leftClass} project-two-col__col ${projectColumnClass(leftKind)}`}
          data-viewport-reveal={leftKind === 'text' ? 'off' : undefined}
        >
          {left.length ? left.map((b, i) => <ProjectBlockRenderer key={i} block={b} />) : null}
        </div>
        <div
          className={`${rightClass} project-two-col__col ${projectColumnClass(rightKind)}`}
          data-viewport-reveal={rightKind === 'text' ? 'off' : undefined}
        >
          {right.length ? right.map((b, i) => <ProjectBlockRenderer key={i} block={b} />) : null}
        </div>
      </div>
    </section>
  )
}

