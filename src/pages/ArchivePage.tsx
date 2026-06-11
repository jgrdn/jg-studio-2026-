import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Helmet } from 'react-helmet-async'
import { ArchiveImageViewer } from '../components/archive/ArchiveImageViewer'
import { projects } from '../content/site'

type Tile = {
  key: string
  media: string
}

function extractUrl(bg: string): string | null {
  const match = bg.match(/url\(\s*["']?(.*?)["']?\s*\)/i)
  return match?.[1] ?? null
}

type OpenView = {
  media: string
  aspect: string
}

export function ArchivePage() {
  const [openView, setOpenView] = useState<OpenView | null>(null)
  const originTileRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    document.body.classList.add('is-archive')
    return () => document.body.classList.remove('is-archive')
  }, [])

  const baseMedia = useMemo(
    () =>
      projects
        .filter((p) => p.slug !== 'archive')
        .map((p) => p.media)
        .filter(Boolean),
    [],
  )

  // Resolve each asset's true ratio so the wall renders uncropped and the
  // open transition is a clean uniform scale (tile ratio == preview ratio).
  const [ratios, setRatios] = useState<Record<string, number>>({})
  useEffect(() => {
    let cancelled = false
    baseMedia.forEach((media) => {
      const url = extractUrl(media)
      if (!url) return
      const img = new Image()
      const apply = () => {
        if (cancelled || !img.naturalWidth || !img.naturalHeight) return
        setRatios((prev) =>
          prev[media] ? prev : { ...prev, [media]: img.naturalWidth / img.naturalHeight },
        )
      }
      img.onload = apply
      img.src = url
      if (img.complete) apply()
    })
    return () => {
      cancelled = true
    }
  }, [baseMedia])

  const tiles = useMemo<Tile[]>(() => {
    const out: Tile[] = []
    const n = Math.max(24, baseMedia.length * 3)
    for (let i = 0; i < n; i++) {
      out.push({ key: `tile-${i}`, media: baseMedia[i % baseMedia.length] })
    }
    return out
  }, [baseMedia])

  const colA = tiles.slice(0, Math.floor(tiles.length / 3))
  const colB = tiles.slice(Math.floor(tiles.length / 3), Math.floor((tiles.length * 2) / 3))
  const colC = tiles.slice(Math.floor((tiles.length * 2) / 3))

  const tileStyle = (t: Tile): CSSProperties => {
    const ratio = ratios[t.media]
    return {
      '--tile-media': t.media,
      ...(ratio ? { '--tile-ratio': String(ratio) } : {}),
    } as CSSProperties
  }

  const renderColumn = (items: Tile[]) => {
    const loop = [...items, ...items]
    return (
      <div className="archive-wall__marquee">
        <div className="archive-wall__marquee-inner">
          {loop.map((t, i) => {
            const isClone = i >= items.length
            return (
              <button
                key={`${t.key}-${i}`}
                type="button"
                className="archive-wall__tile"
                style={tileStyle(t)}
                tabIndex={isClone ? -1 : 0}
                aria-hidden={isClone}
                aria-label={isClone ? undefined : 'View image'}
                onClick={(e) => {
                  originTileRef.current = e.currentTarget
                  const ratio = ratios[t.media]
                  setOpenView({
                    media: t.media,
                    aspect: ratio ? `${ratio} / 1` : '4 / 3',
                  })
                }}
                data-cursor-variant="pill"
                data-cursor-label="View"
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <main className="archive-page" aria-label="Archive">
      <Helmet>
        <title>Archive | Joey Gordon</title>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://jg.studio/work/archive" />
      </Helmet>

      <section className="archive-wall" aria-label="Archive wall">
        <div className="archive-wall__col archive-wall__col--left">{renderColumn(colA)}</div>
        <div className="archive-wall__col archive-wall__col--mid">{renderColumn(colB)}</div>
        <div className="archive-wall__col archive-wall__col--right">{renderColumn(colC)}</div>
      </section>

      {openView && originTileRef.current ? (
        <ArchiveImageViewer
          media={openView.media}
          aspect={openView.aspect}
          originEl={originTileRef.current}
          onClose={() => {
            setOpenView(null)
            originTileRef.current = null
          }}
        />
      ) : null}
    </main>
  )
}
