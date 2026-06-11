import { RecognitionTable } from './RecognitionTable'

export function Recognition() {
  return (
    <section
      className="recognition-section"
      id="recognition"
      aria-labelledby="recognition-heading"
    >
      <div className="grid-12 grid-12--rg recognition-section__grid">
        <div className="span-4 recognition-sidebar" data-viewport-reveal="off">
          <h2 id="recognition-heading" className="recognition-title">
            Recognition
            <br />&amp; features
          </h2>
        </div>
        <div className="span-12 recognition-table-wrap">
          <RecognitionTable />
        </div>
      </div>
    </section>
  )
}
