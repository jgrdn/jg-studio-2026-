import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { site } from '../content/site'

export function HeroMedia() {
  const hasVideo = Boolean(site.heroVideo)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoLabel, setVideoLabel] = useState<'⏸' | '▶'>('⏸')

  const togglePlayback = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [])

  useEffect(() => {
    if (!hasVideo) return
    const v = videoRef.current
    if (!v) return
    const update = () => setVideoLabel(v.paused ? '▶' : '⏸')
    update()
    v.addEventListener('play', update)
    v.addEventListener('pause', update)
    return () => {
      v.removeEventListener('play', update)
      v.removeEventListener('pause', update)
    }
  }, [hasVideo])

  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return

    const root = document.documentElement

    const apply = () => {
      const rect = el.getBoundingClientRect()
      if (!Number.isFinite(rect.height) || rect.height <= 0) return
      root.style.setProperty('--hero-media-height-actual', `${rect.height}px`)
    }

    apply()

    const ro = new ResizeObserver(() => apply())
    ro.observe(el)
    window.addEventListener('resize', apply)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
      root.style.removeProperty('--hero-media-height-actual')
    }
  }, [])

  return (
    <div className="hero-media">
      <div ref={frameRef} className="hero-media__frame">
        {hasVideo ? (
          <video
            ref={videoRef}
            className="hero-media__video"
            poster={site.heroImage}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            aria-label={videoLabel === '▶' ? 'Showreel, paused. Press to play.' : 'Showreel, playing. Press to pause.'}
            tabIndex={0}
            data-cursor-variant="icon"
            data-cursor-label={videoLabel}
            onClick={togglePlayback}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                togglePlayback()
              }
            }}
          >
            <source src={site.heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img
            className="hero-media__img"
            src={site.heroImage}
            width={1500}
            height={1000}
            alt=""
            decoding="async"
          />
        )}
      </div>
    </div>
  )
}
