import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { GifCropEditor } from './GifCropEditor'
import {
  ASPECT_PRESETS,
  aspectRatioValue,
  cropCenter,
  cropPixelSize,
  defaultEditableCrop,
  fitCropToAspect,
  isFullFrameCrop,
  parseCustomAspectRatio,
  type AspectRatioPreset,
  type NormalizedCrop,
} from '../lib/gifConvertor/crop'
import type { GifColourFormat } from '../lib/gifConvertor/convertVideoToGif'
import { closeDecodedGif, decodeGifFile } from '../lib/gifConvertor/decodeGif'
import {
  convertMediaToGif,
  formatBytes,
  type GifLoopMode,
} from '../lib/gifConvertor/convertVideoToGif'
import {
  GIF_MAKER_OG_IMAGE,
  GIF_MAKER_OG_IMAGE_HEIGHT,
  GIF_MAKER_OG_IMAGE_WIDTH,
  GIF_MAKER_ORIGIN,
} from '../lib/gifConvertor/host'
import {
  GIF_MAKER_DESCRIPTION,
  GIF_MAKER_JSON_LD,
  GIF_MAKER_OG_ALT,
  GIF_MAKER_SITE_NAME,
  GIF_MAKER_TITLE,
} from '../lib/gifConvertor/seo'
import { isAcceptedMediaFile, isGifMediaFile } from '../lib/gifConvertor/mediaTypes'
import { StudioMark } from '../components/StudioMark'
import { formatTime } from '../lib/gifConvertor/formatTime'
import { outputGifName, sanitizeOutputBasename } from '../lib/gifConvertor/outputFilename'
import { useGifConvertorSettings } from '../hooks/useGifConvertorSettings'

const LOOP_PRESETS: { value: GifLoopMode | 'custom'; label: string }[] = [
  { value: -1, label: 'Once' },
  { value: 0, label: 'Forever' },
  { value: 2, label: '2×' },
  { value: 3, label: '3×' },
  { value: 5, label: '5×' },
  { value: 10, label: '10×' },
  { value: 'custom', label: 'Custom…' },
]

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V6m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

type VideoMeta = {
  duration: number
  width: number
  height: number
  name: string
}

export function GifConvertorPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [meta, setMeta] = useState<VideoMeta | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)

  const {
    fps,
    setFps,
    width,
    setWidth,
    maxColors,
    setMaxColors,
    colourFormat,
    setColourFormat,
    aspectPreset,
    setAspectPreset,
    customAspectW,
    setCustomAspectW,
    customAspectH,
    setCustomAspectH,
    crop,
    setCrop,
    reverse,
    setReverse,
    bounce,
    setBounce,
    loopPreset,
    setLoopPreset,
    loopCustom,
    setLoopCustom,
    applyToVideo,
    resetToDefaults,
  } = useGifConvertorSettings()

  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [gifBytes, setGifBytes] = useState<number | null>(null)
  const [outputBasename, setOutputBasename] = useState('output')

  const loop: GifLoopMode =
    loopPreset === 'custom' ? Math.max(1, Math.min(99, loopCustom)) : loopPreset

  const cropAspect = useMemo(() => {
    if (!meta) return 1
    return (crop.w * meta.width) / (crop.h * meta.height)
  }, [crop, meta])

  const outputHeight = useMemo(() => {
    return Math.max(16, Math.round(width / cropAspect))
  }, [cropAspect, width])

  const cropPixels = useMemo(() => {
    if (!meta) return null
    return cropPixelSize(crop, meta.width, meta.height)
  }, [crop, meta])

  const lockAspect = useMemo(() => {
    if (!meta || aspectPreset === 'free') return null
    return aspectRatioValue(
      aspectPreset,
      meta.width,
      meta.height,
      customAspectW,
      customAspectH,
    )
  }, [aspectPreset, customAspectW, customAspectH, meta])

  const maxOutputWidth = useMemo(() => {
    if (!cropPixels) return 1920
    return Math.min(1920, cropPixels.width)
  }, [cropPixels])

  const maxOutputHeight = useMemo(() => {
    if (!cropPixels) return 1080
    return Math.min(1920, cropPixels.height)
  }, [cropPixels])

  const outputName = useMemo(() => outputGifName(outputBasename), [outputBasename])

  const resetOutput = useCallback(() => {
    setGifUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setGifBytes(null)
    setError(null)
    setProgress(0)
    setProgressLabel('')
  }, [])

  const clearVideo = useCallback(() => {
    setFile(null)
    setMeta(null)
    setTrimStart(0)
    setTrimEnd(0)
    setOutputBasename('output')
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    resetOutput()
  }, [resetOutput])

  const loadFile = useCallback(
    (next: File) => {
      if (!isAcceptedMediaFile(next)) {
        setError('Please choose a video or GIF file (MP4, WebM, MOV, GIF, etc.).')
        return
      }

      clearVideo()
      const url = URL.createObjectURL(next)
      const base = next.name.replace(/\.[^.]+$/, '')
      setFile(next)
      setVideoUrl(url)
      setOutputBasename(sanitizeOutputBasename(base))
      setError(null)
    },
    [clearVideo],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const applyMeta = (duration: number, width: number, height: number) => {
      const nextMeta: VideoMeta = {
        duration,
        width,
        height,
        name: file?.name ?? 'media',
      }
      setMeta(nextMeta)
      setTrimStart(0)
      setTrimEnd(duration)
      applyToVideo(width, height)
    }

    const onLoaded = async () => {
      let duration = video.duration
      let width = video.videoWidth
      let height = video.videoHeight

      if (
        file &&
        isGifMediaFile(file) &&
        (!width || !height || !Number.isFinite(duration) || duration <= 0)
      ) {
        try {
          const decoded = await decodeGifFile(file)
          duration = decoded.duration
          width = decoded.width
          height = decoded.height
          closeDecodedGif(decoded)
        } catch {
          setError('Could not read this GIF.')
          return
        }
      }

      if (!width || !height || !Number.isFinite(duration) || duration <= 0) {
        setError('Could not read this file.')
        return
      }

      applyMeta(duration, width, height)
    }

    video.addEventListener('loadedmetadata', onLoaded)
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [videoUrl, file, applyToVideo])

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      if (gifUrl) URL.revokeObjectURL(gifUrl)
    }
  }, [videoUrl, gifUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime < trimStart || video.currentTime > trimEnd) {
      video.currentTime = trimStart
    }
  }, [trimStart, trimEnd])

  function onAspectChange(preset: AspectRatioPreset) {
    if (!meta) return
    setAspectPreset(preset)
    if (preset === 'free') {
      if (isFullFrameCrop(crop)) setCrop(defaultEditableCrop())
      resetOutput()
      return
    }
    const center = cropCenter(crop)
    const aspect = aspectRatioValue(
      preset,
      meta.width,
      meta.height,
      customAspectW,
      customAspectH,
    )
    const next = fitCropToAspect(meta.width, meta.height, aspect, center.x, center.y)
    setCrop(isFullFrameCrop(next) ? defaultEditableCrop() : next)
    resetOutput()
  }

  function onCustomAspectChange(nextW: number, nextH: number) {
    if (!meta) return
    const w = Math.max(1, Math.min(9999, Math.round(nextW)))
    const h = Math.max(1, Math.min(9999, Math.round(nextH)))
    setCustomAspectW(w)
    setCustomAspectH(h)
    if (aspectPreset === 'custom') {
      const center = cropCenter(crop)
      const aspect = parseCustomAspectRatio(w, h)
      const next = fitCropToAspect(meta.width, meta.height, aspect, center.x, center.y)
      setCrop(isFullFrameCrop(next) ? defaultEditableCrop() : next)
    }
    resetOutput()
  }

  function onCropChange(next: NormalizedCrop) {
    setCrop(next)
    resetOutput()
  }

  const onCornerResizeStart = useCallback(() => {
    if (aspectPreset === 'free') return
    setAspectPreset('free')
    setCrop((current) => (isFullFrameCrop(current) ? defaultEditableCrop() : current))
    resetOutput()
  }, [aspectPreset, resetOutput, setAspectPreset, setCrop])

  async function onConvert() {
    if (!file || !meta) return

    resetOutput()
    setIsConverting(true)

    try {
      const blob = await convertMediaToGif(
        file,
        {
          fps,
          width,
          trimStart,
          trimEnd,
          maxColors,
          colourFormat,
          crop,
          reverse,
          bounce,
          loop,
        },
        ({ frame, totalFrames, ratio }) => {
          setProgress(ratio)
          setProgressLabel(`Encoding frame ${frame} of ${totalFrames}`)
        },
      )

      const url = URL.createObjectURL(blob)
      setGifUrl(url)
      setGifBytes(blob.size)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="gif-tool">
      <Helmet prioritizeSeoTags>
        <html lang="en-GB" />
        <title>{GIF_MAKER_TITLE}</title>
        <meta name="description" content={GIF_MAKER_DESCRIPTION} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={`${GIF_MAKER_ORIGIN}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={GIF_MAKER_SITE_NAME} />
        <meta property="og:title" content={GIF_MAKER_TITLE} />
        <meta property="og:description" content={GIF_MAKER_DESCRIPTION} />
        <meta property="og:url" content={`${GIF_MAKER_ORIGIN}/`} />
        <meta property="og:image" content={GIF_MAKER_OG_IMAGE} />
        <meta property="og:image:secure_url" content={GIF_MAKER_OG_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content={String(GIF_MAKER_OG_IMAGE_WIDTH)} />
        <meta property="og:image:height" content={String(GIF_MAKER_OG_IMAGE_HEIGHT)} />
        <meta property="og:image:alt" content={GIF_MAKER_OG_ALT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={GIF_MAKER_TITLE} />
        <meta name="twitter:description" content={GIF_MAKER_DESCRIPTION} />
        <meta name="twitter:image" content={GIF_MAKER_OG_IMAGE} />
        <meta name="theme-color" content="#060606" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <script type="application/ld+json">{JSON.stringify(GIF_MAKER_JSON_LD)}</script>
      </Helmet>

      <div className="gif-tool__grain" aria-hidden />

      <div className="gif-tool__backdrop" aria-hidden>
        <div className="gif-tool__grid" />
        <div className="gif-tool__backdrop-scrim" />
      </div>

      <div className="gif-tool__shell">
        <header className="gif-tool__header">
          <div className="gif-tool__brand">
            <StudioMark to="/" className="gif-tool__mark" />
            <div className="gif-tool__brand-copy">
              <h1 className="gif-tool__title">Gif Maker</h1>
              <p className="gif-tool__tagline">JG Studio</p>
            </div>
          </div>
          <div className="gif-tool__status" aria-label="Tool status">
            <span className="gif-tool__status-pill">Private</span>
            <span className="gif-tool__status-pill">No upload</span>
          </div>
        </header>

        <main className="gif-tool__main">
          {!file ? (
            <section className="gif-tool__hero" aria-label="Introduction">
              <p className="gif-tool__hero-eyebrow">Gif Maker</p>
              <h2 className="gif-tool__hero-title">
                Drop footage.
                <br />
                Ship a GIF.
              </h2>
              <p className="gif-tool__hero-copy">
                Trim, crop, set frame rate and palette, then download.
                <br />
                Your files never leave this tab.
              </p>
            </section>
          ) : null}

          <div className={`gif-tool__workbench${file ? ' gif-tool__workbench--editor' : ''}`}>
            <div className="gif-tool__workbench-inner">
              {!file ? (
                <label
                  className={`gif-tool__drop${isDragging ? ' is-dragging' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const dropped = e.dataTransfer.files?.[0]
                    if (dropped) loadFile(dropped)
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/*,image/gif,.gif"
                    onChange={(e) => {
                      const picked = e.target.files?.[0]
                      if (picked) loadFile(picked)
                    }}
                  />
                  <span className="gif-tool__drop-icon">
                    <UploadIcon />
                  </span>
                  <strong>Choose video or GIF</strong>
                  <p className="gif-tool__drop-copy gif-tool__drop-copy--mobile">
                    Tap to browse · MP4, WebM, MOV, GIF
                  </p>
                  <p className="gif-tool__drop-copy gif-tool__drop-copy--desktop">
                    Drop here or click to browse · MP4, WebM, MOV, GIF
                  </p>
                </label>
              ) : (
                <div className="gif-tool__layout">
            <section className="gif-tool__preview" aria-label="Media preview">
              <div className="gif-tool__preview-card">
                {videoUrl ? (
                  <div className="gif-tool__preview-body">
                    <GifCropEditor
                      videoRef={videoRef}
                      videoUrl={videoUrl}
                      videoWidth={meta?.width ?? 16}
                      videoHeight={meta?.height ?? 9}
                      duration={meta?.duration ?? 0}
                      trimStart={trimStart}
                      trimEnd={trimEnd}
                      crop={crop}
                      lockAspect={lockAspect}
                      onCropChange={onCropChange}
                      onCornerResizeStart={onCornerResizeStart}
                    />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="gif-tool__panel" aria-label="Conversion settings">
              <div className="gif-tool__panel-head">
                <h2 className="gif-tool__panel-title">Export</h2>
                <span className="gif-tool__panel-badge">On-device</span>
              </div>

              <div className="gif-tool__panel-body">
              <div className="gif-tool__panel-grid">
              <div className="gif-tool__group">
                <label className="gif-tool__label" htmlFor="gif-aspect">
                  Aspect ratio
                </label>
                <select
                  id="gif-aspect"
                  className="gif-tool__select"
                  value={aspectPreset}
                  onChange={(e) => onAspectChange(e.target.value as AspectRatioPreset)}
                >
                  {ASPECT_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {aspectPreset === 'custom' ? (
                <div className="gif-tool__group">
                  <span className="gif-tool__label">Custom ratio</span>
                  <div className="gif-tool__aspect-row">
                    <input
                      className="gif-tool__input"
                      type="number"
                      min={1}
                      max={9999}
                      value={customAspectW}
                      onChange={(e) => onCustomAspectChange(Number(e.target.value), customAspectH)}
                      aria-label="Custom aspect width"
                    />
                    <span className="gif-tool__aspect-sep">:</span>
                    <input
                      className="gif-tool__input"
                      type="number"
                      min={1}
                      max={9999}
                      value={customAspectH}
                      onChange={(e) => onCustomAspectChange(customAspectW, Number(e.target.value))}
                      aria-label="Custom aspect height"
                    />
                  </div>
                </div>
              ) : null}

              <div className="gif-tool__group">
                <label className="gif-tool__label" htmlFor="gif-loop">
                  Loop
                </label>
                <div className="gif-tool__loop-row">
                  <select
                    id="gif-loop"
                    className="gif-tool__select"
                    value={String(loopPreset)}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (raw === 'custom') {
                        setLoopPreset('custom')
                      } else {
                        setLoopPreset(Number(raw) as GifLoopMode)
                      }
                      resetOutput()
                    }}
                  >
                    {LOOP_PRESETS.map((opt) => (
                      <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {loopPreset === 'custom' ? (
                    <input
                      className="gif-tool__input"
                      type="number"
                      min={1}
                      max={99}
                      value={loopCustom}
                      onChange={(e) => {
                        setLoopCustom(Number(e.target.value))
                        resetOutput()
                      }}
                      aria-label="Custom loop count"
                    />
                  ) : null}
                </div>
              </div>
              </div>

              <div className="gif-tool__group gif-tool__group--trim">
                <div className="gif-tool__label-row">
                  <span className="gif-tool__label">Trim</span>
                  <span className="gif-tool__value">
                    {formatTime(trimStart)} to {formatTime(trimEnd)}
                  </span>
                </div>
                <div className="gif-tool__range-pair">
                  <label className="gif-tool__range-label">
                    <span>In</span>
                    <input
                      className="gif-tool__range"
                      type="range"
                      min={0}
                      max={meta?.duration ?? 1}
                      step={0.05}
                      value={trimStart}
                      onChange={(e) => {
                        const next = Number(e.target.value)
                        setTrimStart(Math.min(next, trimEnd - 0.05))
                        resetOutput()
                      }}
                    />
                  </label>
                  <label className="gif-tool__range-label">
                    <span>Out</span>
                    <input
                      className="gif-tool__range"
                      type="range"
                      min={0}
                      max={meta?.duration ?? 1}
                      step={0.05}
                      value={trimEnd}
                      onChange={(e) => {
                        const next = Number(e.target.value)
                        setTrimEnd(Math.max(next, trimStart + 0.05))
                        resetOutput()
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="gif-tool__panel-grid gif-tool__panel-grid--sliders">
              <div className="gif-tool__group">
                <div className="gif-tool__label-row">
                  <span className="gif-tool__label">Frame rate</span>
                  <span className="gif-tool__value">{fps} fps</span>
                </div>
                <input
                  className="gif-tool__range"
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={fps}
                  onChange={(e) => {
                    setFps(Number(e.target.value))
                    resetOutput()
                  }}
                />
              </div>

              <div className="gif-tool__group">
                <div className="gif-tool__label-row">
                  <span className="gif-tool__label">Width</span>
                  <span className="gif-tool__value">{width}px</span>
                </div>
                <input
                  className="gif-tool__range"
                  type="range"
                  min={120}
                  max={maxOutputWidth}
                  step={10}
                  value={width}
                  onChange={(e) => {
                    setWidth(Number(e.target.value))
                    resetOutput()
                  }}
                />
              </div>

              <div className="gif-tool__group">
                <div className="gif-tool__label-row">
                  <span className="gif-tool__label">Height</span>
                  <span className="gif-tool__value">{outputHeight}px</span>
                </div>
                <input
                  className="gif-tool__range"
                  type="range"
                  min={120}
                  max={maxOutputHeight}
                  step={10}
                  value={outputHeight}
                  onChange={(e) => {
                    const nextHeight = Number(e.target.value)
                    setWidth(Math.max(120, Math.min(maxOutputWidth, Math.round(nextHeight * cropAspect))))
                    resetOutput()
                  }}
                />
              </div>

              <div className="gif-tool__group">
                <div className="gif-tool__label-row">
                  <span className="gif-tool__label">Colours</span>
                  <span className="gif-tool__value">{maxColors}</span>
                </div>
                <input
                  className="gif-tool__range"
                  type="range"
                  min={8}
                  max={256}
                  step={8}
                  value={maxColors}
                  onChange={(e) => {
                    setMaxColors(Number(e.target.value))
                    resetOutput()
                  }}
                />
              </div>

              <div className="gif-tool__group">
                <label className="gif-tool__label" htmlFor="gif-colour-format">
                  Quality
                </label>
                <select
                  id="gif-colour-format"
                  className="gif-tool__select"
                  value={colourFormat}
                  onChange={(e) => {
                    setColourFormat(e.target.value as GifColourFormat)
                    resetOutput()
                  }}
                >
                  <option value="rgb565">Standard</option>
                  <option value="rgb444">Fast</option>
                </select>
              </div>
              </div>

              <div className="gif-tool__group">
                <span className="gif-tool__label">Playback</span>
                <div className="gif-tool__toggles">
                  <label className="gif-tool__toggle">
                    <input
                      type="checkbox"
                      checked={reverse}
                      onChange={(e) => {
                        const on = e.target.checked
                        setReverse(on)
                        if (on) setBounce(false)
                        resetOutput()
                      }}
                    />
                    Reverse
                  </label>
                  <label className="gif-tool__toggle">
                    <input
                      type="checkbox"
                      checked={bounce}
                      onChange={(e) => {
                        const on = e.target.checked
                        setBounce(on)
                        if (on) setReverse(false)
                        resetOutput()
                      }}
                    />
                    Bounce
                  </label>
                </div>
              </div>
              </div>

              <div className="gif-tool__panel-foot">
              {error ? <p className="gif-tool__error">{error}</p> : null}

              <div className="gif-tool__group">
                <label className="gif-tool__label" htmlFor="gif-filename">
                  File name
                </label>
                <div className="gif-tool__filename-row">
                  <input
                    id="gif-filename"
                    className="gif-tool__input gif-tool__filename-input"
                    type="text"
                    value={outputBasename}
                    onChange={(e) => setOutputBasename(e.target.value)}
                    onBlur={() => setOutputBasename((name) => sanitizeOutputBasename(name))}
                    placeholder="my-animation"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <span className="gif-tool__filename-ext">.gif</span>
                </div>
              </div>

              <div className="gif-tool__actions">
                <button
                  type="button"
                  className="gif-tool__button"
                  disabled={isConverting || !meta}
                  onClick={onConvert}
                >
                  {isConverting ? 'Making GIF…' : 'Make GIF'}
                </button>
                <button type="button" className="gif-tool__button gif-tool__button--ghost" onClick={clearVideo}>
                  Choose another file
                </button>
              </div>

              {isConverting ? (
                <div className="gif-tool__progress" aria-live="polite">
                  <div className="gif-tool__progress-bar">
                    <div className="gif-tool__progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                  <p>{progressLabel}</p>
                </div>
              ) : null}

              {gifUrl ? (
                <div className="gif-tool__result">
                  <div className="gif-tool__result-head">
                    <h3 className="gif-tool__result-title">Output</h3>
                    {gifBytes != null ? <span className="gif-tool__chip">{formatBytes(gifBytes)}</span> : null}
                  </div>
                  <img src={gifUrl} alt="Converted GIF preview" />
                  <a className="gif-tool__button" href={gifUrl} download={outputName}>
                    Download GIF
                  </a>
                </div>
              ) : null}

              <button
                type="button"
                className="gif-tool__text-btn"
                onClick={resetToDefaults}
              >
                Reset saved settings
              </button>
              </div>
            </section>
                </div>
              )}
            </div>
          </div>

        </main>

        <footer className="gif-tool__footer">
          <p>Runs locally in your browser · Settings saved on this device</p>
        </footer>
      </div>
    </div>
  )
}
