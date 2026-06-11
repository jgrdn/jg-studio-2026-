import { useCallback, useRef, type CSSProperties } from 'react'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

export function useProjectCardVideoHover(videoSrc?: string) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()

  const onMouseEnter = useCallback(() => {
    if (!videoSrc || reduced) return
    const v = videoRef.current
    if (!v) return
    void v.play().catch(() => {})
  }, [videoSrc, reduced])

  const onMouseLeave = useCallback(() => {
    if (!videoSrc) return
    const v = videoRef.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }, [videoSrc])

  return { videoRef, onMouseEnter, onMouseLeave }
}

type MediaProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  videoSrc?: string
  media: string
}

export function ProjectCardMedia({ videoRef, videoSrc, media }: MediaProps) {
  if (videoSrc) {
    return (
      <video
        ref={videoRef}
        className="project-card__media project-card__media--video"
        src={videoSrc}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
    )
  }

  return (
    <div
      className="project-card__media"
      style={{ '--card-media': media } as CSSProperties}
      aria-hidden
    />
  )
}
