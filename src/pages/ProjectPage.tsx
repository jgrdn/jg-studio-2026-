import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { DEFAULT_THUMBNAIL } from '../content/media'
import { projects } from '../content/site'
import { ProjectBlockRenderer } from '../components/project/ProjectBlockRenderer'
import { Contact } from '../components/Contact'
import { Helmet } from 'react-helmet-async'

export function ProjectPage() {
  const { slug } = useParams()

  const project = useMemo(() => {
    if (!slug) return null
    return projects.find((p) => p.slug === slug) ?? null
  }, [slug])

  if (!project) {
    return (
      <main id="top" className="project-page project-page--case" aria-label="Project not found">
        <Helmet>
          <title>Not found | Joey Gordon</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="project-page__stack">
          <div className="grid-12">
            <div className="span-12 project-not-found">
              <h1 className="project-title">Project not found</h1>
              <p className="project-paragraph">This page does not exist.</p>
            </div>
          </div>
        </div>
        <Contact />
      </main>
    )
  }

  const canonical = `https://jg.studio/work/${project.slug}`
  const title = `${project.title} | Joey Gordon`
  const description = project.summary
  const ogImage = `https://jg.studio${project.ogImage ?? DEFAULT_THUMBNAIL}`

  const startsWithHero = project.blocks[0]?.type === 'projectHero'

  return (
    <main id="top" className="project-page project-page--case" aria-label={project.title}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="JG Studio" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={`${project.title} project cover`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description,
            url: canonical,
            image: ogImage,
            author: {
              '@type': 'Person',
              name: 'Joey Gordon',
              url: 'https://jg.studio/',
            },
          })}
        </script>
      </Helmet>

      <div className="project-page__stack">
        {!startsWithHero ? (
          <header className="project-hero project-hero--simple">
            <div className="grid-12 grid-12--rg">
              <div className="span-12">
                <p className="project-eyebrow">Selected work</p>
                <h1 className="project-title">{project.title}</h1>
                <p className="project-subtitle">{project.subtitle}</p>
              </div>
            </div>
          </header>
        ) : null}

        {project.blocks.map((block, i) => (
          <ProjectBlockRenderer key={i} block={block} />
        ))}
      </div>

      <Contact />
    </main>
  )
}
