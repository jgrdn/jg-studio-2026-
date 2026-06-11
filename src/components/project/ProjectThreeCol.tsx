import type { ProjectBlock } from '../../content/projects/types'
import { ProjectBlockRenderer } from './ProjectBlockRenderer'
import { projectColumnClass, projectColumnKind } from './projectColumnKind'

export function ProjectThreeCol({
  left,
  middle,
  right,
}: {
  left: ProjectBlock[]
  middle: ProjectBlock[]
  right: ProjectBlock[]
}) {
  const leftKind = projectColumnKind(left)
  const middleKind = projectColumnKind(middle)
  const rightKind = projectColumnKind(right)

  return (
    <section
      className="project-block project-three-col"
      aria-label="Three column section"
      data-viewport-reveal="off"
    >
      <div className="grid-12 grid-12--rg">
        <div
          className={`span-4 project-three-col__col ${projectColumnClass(leftKind)}`}
          data-viewport-reveal={leftKind === 'text' ? 'off' : undefined}
        >
          {left.map((b, i) => (
            <ProjectBlockRenderer key={i} block={b} />
          ))}
        </div>
        <div
          className={`span-4 project-three-col__col ${projectColumnClass(middleKind)}`}
          data-viewport-reveal={middleKind === 'text' ? 'off' : undefined}
        >
          {middle.map((b, i) => (
            <ProjectBlockRenderer key={i} block={b} />
          ))}
        </div>
        <div
          className={`span-4 project-three-col__col ${projectColumnClass(rightKind)}`}
          data-viewport-reveal={rightKind === 'text' ? 'off' : undefined}
        >
          {right.map((b, i) => (
            <ProjectBlockRenderer key={i} block={b} />
          ))}
        </div>
      </div>
    </section>
  )
}
