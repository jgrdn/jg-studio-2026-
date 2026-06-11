import { recognitionGroups } from '../content/site'

export function RecognitionTable() {
  return (
    <div className="rec-table" role="region" aria-label="Recognition and features">
      <ul className="rec-table__body" role="list">
        {recognitionGroups.map((group) => (
          <li
            key={group.organisation}
            className="rec-table__row"
            role="group"
            aria-label={group.organisation}
          >
            <div className="rec-table__band">
              <p className="rec-table__org">{group.organisation}</p>
              <div className="rec-table__entries">
                {group.entries.map((entry, index) => (
                  <div
                    key={`${entry.award}-${entry.project}-${index}`}
                    className="rec-table__pair"
                    role="row"
                  >
                    <p className="rec-table__award">{entry.award}</p>
                    <p className="rec-table__project">{entry.project}</p>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
