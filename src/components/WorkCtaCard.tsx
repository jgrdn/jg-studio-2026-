import { useRef } from 'react'
import { site } from '../content/site'
import { useWorkCtaCardMotion } from '../hooks/useWorkCtaCardMotion'

function SlotPlusIcon() {
  return (
    <svg className="project-card__slot-plus" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SlotAntsFrame() {
  return (
    <svg className="project-card__slot-ants" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect className="project-card__slot-ants__rect" vectorEffect="nonScalingStroke" />
    </svg>
  )
}

export function WorkCtaCard({ variant = 'grid' }: { variant?: 'grid' | 'adjacent' }) {
  const ref = useRef<HTMLAnchorElement>(null)
  useWorkCtaCardMotion(ref)

  return (
    <a
      ref={ref}
      className={`project-card project-card--cta project-card--cta-slot${
        variant === 'adjacent' ? ' project-card--cta-slot-adjacent' : ''
      }`}
      href={`mailto:${site.email}?subject=${encodeURIComponent('New project enquiry')}`}
      data-cursor-variant="pill"
      data-cursor-label="Start a project"
      aria-label="New project. Start a conversation with us"
    >
      <SlotAntsFrame />
      <span className="project-card__slot-tag">Open slot</span>

      <div className="project-card__slot-media" aria-hidden>
        <span className="project-card__slot-grid" />
        <span className="project-card__slot-ring">
          <SlotPlusIcon />
        </span>
      </div>

      <div className="project-card__bottom">
        <div className="project-card__text">
          <h3>New project</h3>
          <p>Let's work on it together.</p>
        </div>
      </div>
    </a>
  )
}
