import { site } from '../content/site'

export function Hero() {
  return (
    <div className="hero-copy" id="about" aria-labelledby="hero-heading">
      <div className="hero-copy__align-slot">
        <h1 id="hero-heading" className="hero-title">
          {site.name}
        </h1>
        <p className="hero-intro">{site.intro}</p>
      </div>
      <div className="hero-bio" data-viewport-reveal="off">
        {site.aboutParagraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}
