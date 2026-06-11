const PHRASES = ["Let's talk", 'Got a project?'] as const

function MarqueeSegment() {
  return (
    <span className="marquee__segment">
      {PHRASES.map((text) => (
        <span key={text} className="marquee__phrase-group">
          <span className="marquee__phrase">{text}</span>
          <span className="marquee__sep" aria-hidden>
            •
          </span>
        </span>
      ))}
    </span>
  )
}

function MarqueeStrip() {
  return (
    <span className="marquee__strip">
      {Array.from({ length: 8 }, (_, i) => (
        <MarqueeSegment key={i} />
      ))}
    </span>
  )
}

export function Marquee() {
  return (
    <div className="span-12 marquee" aria-hidden="true">
      <div className="marquee__track">
        <MarqueeStrip />
        <MarqueeStrip aria-hidden />
      </div>
    </div>
  )
}
