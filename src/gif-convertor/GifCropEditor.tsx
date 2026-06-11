import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { formatTime } from '../lib/gifConvertor/formatTime'
import type { CropHandle, NormalizedCrop } from '../lib/gifConvertor/crop'
import { isCornerCropHandle, moveCrop, resizeCrop } from '../lib/gifConvertor/crop'

const HANDLES: CropHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

type DragState =
  | { mode: 'move'; pointerId: number; startX: number; startY: number; crop: NormalizedCrop }
  | {
      mode: 'resize'
      pointerId: number
      handle: CropHandle
      startX: number
      startY: number
      crop: NormalizedCrop
    }

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  videoUrl: string
  videoWidth: number
  videoHeight: number
  duration: number
  trimStart: number
  trimEnd: number
  crop: NormalizedCrop
  lockAspect: number | null
  onCropChange: (crop: NormalizedCrop) => void
  onCornerResizeStart?: () => void
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" />
    </svg>
  )
}

export function GifCropEditor({
  videoRef,
  videoUrl,
  videoWidth,
  videoHeight,
  duration,
  trimStart,
  trimEnd,
  crop,
  lockAspect,
  onCropChange,
  onCornerResizeStart,
}: Props) {
  const dragRef = useRef<DragState | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const scrubbingRef = useRef(false)
  const freeCornerResizeRef = useRef(false)
  const lockAspectRef = useRef(lockAspect)
  const onCropChangeRef = useRef(onCropChange)
  const onCornerResizeStartRef = useRef(onCornerResizeStart)
  lockAspectRef.current = lockAspect
  onCropChangeRef.current = onCropChange
  onCornerResizeStartRef.current = onCornerResizeStart

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const frameStyle = {
    '--gif-video-w': videoWidth,
    '--gif-video-h': videoHeight,
    '--trim-start-pct': duration > 0 ? `${(trimStart / duration) * 100}%` : '0%',
    '--trim-end-pct': duration > 0 ? `${(trimEnd / duration) * 100}%` : '100%',
  } as React.CSSProperties

  const beginMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!frameRef.current) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        mode: 'move',
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        crop: { ...crop },
      }
    },
    [crop],
  )

  const beginResize = useCallback(
    (handle: CropHandle) => (e: React.PointerEvent<HTMLSpanElement>) => {
      if (!frameRef.current) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      const cornerResize = isCornerCropHandle(handle)
      freeCornerResizeRef.current = cornerResize
      if (cornerResize) onCornerResizeStartRef.current?.()
      dragRef.current = {
        mode: 'resize',
        pointerId: e.pointerId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        crop: { ...crop },
      }
    },
    [crop],
  )

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current
      const frame = frameRef.current
      if (!drag || e.pointerId !== drag.pointerId || !frame) return

      e.preventDefault()
      const rect = frame.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const dx = (e.clientX - drag.startX) / rect.width
      const dy = (e.clientY - drag.startY) / rect.height

      if (drag.mode === 'move') {
        onCropChangeRef.current(moveCrop(drag.crop, dx, dy))
        return
      }

      const effectiveLock = freeCornerResizeRef.current ? null : lockAspectRef.current
      onCropChangeRef.current(
        resizeCrop(drag.crop, drag.handle, dx, dy, effectiveLock, videoWidth, videoHeight),
      )
    }

    const endDrag = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || e.pointerId !== drag.pointerId) return
      dragRef.current = null
      freeCornerResizeRef.current = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [videoHeight, videoWidth])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      if (scrubbingRef.current) return
      setCurrentTime(video.currentTime)
      if (!video.paused && video.currentTime >= trimEnd - 0.03) {
        video.pause()
        video.currentTime = trimStart
        setCurrentTime(trimStart)
      }
    }

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onLoaded = () => setCurrentTime(video.currentTime)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('loadedmetadata', onLoaded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [trimEnd, trimStart, videoRef])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      if (video.currentTime < trimStart || video.currentTime >= trimEnd - 0.02) {
        video.currentTime = trimStart
        setCurrentTime(trimStart)
      }
      void video.play()
    } else {
      video.pause()
    }
  }, [trimEnd, trimStart, videoRef])

  const seek = useCallback(
    (next: number) => {
      const video = videoRef.current
      if (!video || !duration) return
      const t = Math.max(0, Math.min(duration, next))
      video.currentTime = t
      setCurrentTime(t)
    },
    [duration, videoRef],
  )

  const hint =
    lockAspect == null
      ? 'Drag inside the frame to move · pull corners to resize freely'
      : 'Drag inside the frame to move · pull corners to scale'

  return (
    <div className="gif-crop" style={frameStyle}>
      <div className="gif-crop__frame">
        <div className="gif-crop__stage" ref={frameRef}>
          <div className="gif-crop__stage-media">
            <video
              ref={videoRef}
              className="gif-crop__video"
              src={videoUrl}
              playsInline
              muted
              preload="auto"
            />
          </div>
          <div className="gif-crop__overlay" aria-hidden>
            <div
              className="gif-crop__box"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.w * 100}%`,
                height: `${crop.h * 100}%`,
              }}
            >
              <div className="gif-crop__box-move" onPointerDown={beginMove} />
              <span className="gif-crop__grid" />
              {HANDLES.map((handle) => (
                <span
                  key={handle}
                  className={`gif-crop__handle gif-crop__handle--${handle}`}
                  onPointerDown={beginResize(handle)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="gif-crop__hint">{hint}</p>

      <div className="gif-crop__transport">
        <button
          type="button"
          className="gif-crop__play-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <PauseIcon /> : <span className="gif-crop__play-glyph"><PlayIcon /></span>}
        </button>

        <div className="gif-crop__scrub">
          <input
            className="gif-crop__scrub-range"
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={Math.min(currentTime, duration || 0)}
            onPointerDown={() => {
              scrubbingRef.current = true
            }}
            onPointerUp={() => {
              scrubbingRef.current = false
            }}
            onPointerCancel={() => {
              scrubbingRef.current = false
            }}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Scrub video"
          />
        </div>

        <span className="gif-crop__time" aria-live="off">
          <span className="gif-crop__time-current">{formatTime(currentTime)}</span>
          <span className="gif-crop__time-sep">/</span>
          <span className="gif-crop__time-duration">{formatTime(duration)}</span>
        </span>
      </div>
    </div>
  )
}
