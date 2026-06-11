export function ProjectRichText({
  eyebrow,
  heading,
  body,
}: {
  eyebrow?: string
  heading?: string
  body: string[]
}) {
  return (
    <section className="project-block project-rich-text">
      {eyebrow ? <p className="project-eyebrow">{eyebrow}</p> : null}
      {heading ? <h2 className="project-heading">{heading}</h2> : null}
      {body.map((p, i) => (
        <p key={i} className="project-paragraph">
          {p}
        </p>
      ))}
    </section>
  )
}

