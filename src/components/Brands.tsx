import { defaultThumbnailBg } from '../content/media'
import { brands } from '../content/site'

/** Cursor preview — default thumbnail until brand artwork ships */
const brandPreviewBg = [defaultThumbnailBg] as const

function splitIntoThirds<T>(items: readonly T[]): [T[], T[], T[]] {
  const n = items.length
  const per = Math.ceil(n / 3)
  return [items.slice(0, per), items.slice(per, per * 2), items.slice(per * 2)]
}

export function Brands() {
  const [colA, colB, colC] = splitIntoThirds(brands)

  return (
    <div className="grid-bridge">
      <div className="span-4 brands-stack" id="brands">
        <h2 className="brands-heading">Brands I&apos;ve worked on</h2>
        <div className="brands-three">
          <ul className="brands-col" role="list">
            {colA.map((name, i) => (
              <li
                key={name}
                data-cursor-variant="preview"
                data-cursor-preview-bg={brandPreviewBg[i % brandPreviewBg.length]}
              >
                {name}
              </li>
            ))}
          </ul>
          <ul className="brands-col" role="list">
            {colB.map((name, i) => (
              <li
                key={name}
                data-cursor-variant="preview"
                data-cursor-preview-bg={
                  brandPreviewBg[(i + colA.length) % brandPreviewBg.length]
                }
              >
                {name}
              </li>
            ))}
          </ul>
          <ul className="brands-col" role="list">
            {colC.map((name, i) => (
              <li
                key={name}
                data-cursor-variant="preview"
                data-cursor-preview-bg={
                  brandPreviewBg[
                    (i + colA.length + colB.length) % brandPreviewBg.length
                  ]
                }
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
