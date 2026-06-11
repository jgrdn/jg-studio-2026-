import { closeDecodedGif, decodeGifFile, gifFrameIndexAtTime } from './decodeGif'
import { isGifMediaFile } from './mediaTypes'
import type { NormalizedCrop } from './crop'

export type GifColourFormat = 'rgb565' | 'rgb444'

/** -1 = once, 0 = forever, n > 0 = play n times total */
export type GifLoopMode = -1 | 0 | number

export type GifConvertOptions = {
  fps: number
  width: number
  trimStart: number
  trimEnd: number
  maxColors: number
  colourFormat: GifColourFormat
  crop: NormalizedCrop
  reverse: boolean
  bounce: boolean
  loop: GifLoopMode
}

export type GifConvertProgress = {
  frame: number
  totalFrames: number
  ratio: number
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!Number.isFinite(time)) {
      reject(new Error('Invalid seek time'))
      return
    }

    const onSeeked = () => {
      cleanup()
      resolve()
    }

    const onError = () => {
      cleanup()
      reject(new Error('Could not seek video'))
    }

    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }

    if (Math.abs(video.currentTime - time) < 0.02) {
      resolve()
      return
    }

    video.addEventListener('seeked', onSeeked, { once: true })
    video.addEventListener('error', onError, { once: true })
    video.currentTime = time
  })
}

async function loadVideo(file: File): Promise<HTMLVideoElement> {
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = URL.createObjectURL(file)

  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Could not load video'))
    }
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('loadeddata', onReady, { once: true })
    video.addEventListener('error', onError, { once: true })
  })

  return video
}

export function buildFrameTimes(
  trimStart: number,
  trimEnd: number,
  fps: number,
  reverse: boolean,
  bounce: boolean,
): number[] {
  const start = trimStart
  const end = trimEnd
  const clipDuration = Math.max(0.05, end - start)
  const count = Math.max(1, Math.ceil(clipDuration * fps))

  const forward: number[] = []
  for (let i = 0; i < count; i++) {
    forward.push(Math.min(end - 0.001, start + i / fps))
  }

  let sequence = forward
  if (reverse) {
    sequence = [...forward].reverse()
  } else if (bounce && forward.length > 1) {
    sequence = [...forward, ...forward.slice(0, -1).reverse()]
  }

  return sequence
}

export function gifRepeatCount(loop: GifLoopMode): number {
  if (loop === 0) return 0
  if (loop < 0) return -1
  return Math.max(0, loop - 1)
}

function cropRect(sourceWidth: number, sourceHeight: number, crop: NormalizedCrop) {
  const cropX = crop.x * sourceWidth
  const cropY = crop.y * sourceHeight
  const cropW = crop.w * sourceWidth
  const cropH = crop.h * sourceHeight
  return { cropX, cropY, cropW, cropH, cropAspect: cropW / cropH }
}

export async function convertGifToGif(
  file: File,
  options: GifConvertOptions,
  onProgress?: (progress: GifConvertProgress) => void,
): Promise<Blob> {
  if (typeof ImageDecoder === 'undefined') {
    return convertVideoToGif(file, options, onProgress)
  }

  const { GIFEncoder, applyPalette, quantize } = await import('gifenc')
  const decoded = await decodeGifFile(file)

  try {
    const duration = decoded.duration
    const start = Math.max(0, Math.min(options.trimStart, duration))
    const end = Math.max(start + 0.05, Math.min(options.trimEnd, duration))

    const { cropX, cropY, cropW, cropH, cropAspect } = cropRect(
      decoded.width,
      decoded.height,
      options.crop,
    )

    const width = Math.max(16, Math.round(options.width))
    const height = Math.max(16, Math.round(width / cropAspect))
    const fps = Math.max(1, Math.min(30, options.fps))
    const maxColors = Math.max(2, Math.min(256, Math.round(options.maxColors)))
    const frameDelay = Math.round(1000 / fps)
    const frameTimes = buildFrameTimes(start, end, fps, options.reverse, options.bounce)
    const totalFrames = frameTimes.length
    const repeat = gifRepeatCount(options.loop)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Canvas is not available')

    const gif = GIFEncoder()

    for (let i = 0; i < totalFrames; i++) {
      const frame = decoded.frames[gifFrameIndexAtTime(decoded.frames, frameTimes[i])]
      ctx.drawImage(frame.bitmap, cropX, cropY, cropW, cropH, 0, 0, width, height)

      const { data } = ctx.getImageData(0, 0, width, height)
      const palette = quantize(data, maxColors, { format: options.colourFormat })
      const index = applyPalette(data, palette, options.colourFormat)

      gif.writeFrame(index, width, height, {
        palette,
        delay: frameDelay,
        dispose: 2,
        ...(i === 0 ? { repeat } : {}),
      })

      onProgress?.({
        frame: i + 1,
        totalFrames,
        ratio: (i + 1) / totalFrames,
      })

      if (i % 3 === 0) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }
    }

    gif.finish()
    const bytes = gif.bytes()
    return new Blob([bytes.slice()], { type: 'image/gif' })
  } finally {
    closeDecodedGif(decoded)
  }
}

export async function convertMediaToGif(
  file: File,
  options: GifConvertOptions,
  onProgress?: (progress: GifConvertProgress) => void,
): Promise<Blob> {
  if (isGifMediaFile(file)) {
    return convertGifToGif(file, options, onProgress)
  }
  return convertVideoToGif(file, options, onProgress)
}

export async function convertVideoToGif(
  file: File,
  options: GifConvertOptions,
  onProgress?: (progress: GifConvertProgress) => void,
): Promise<Blob> {
  const { GIFEncoder, applyPalette, quantize } = await import('gifenc')
  const video = await loadVideo(file)

  try {
    const duration = video.duration
    const start = Math.max(0, Math.min(options.trimStart, duration))
    const end = Math.max(start + 0.05, Math.min(options.trimEnd, duration))

    const sourceWidth = video.videoWidth
    const sourceHeight = video.videoHeight
    if (!sourceWidth || !sourceHeight) {
      throw new Error('Video has no readable dimensions')
    }

    const { cropX, cropY, cropW, cropH, cropAspect } = cropRect(
      sourceWidth,
      sourceHeight,
      options.crop,
    )

    const width = Math.max(16, Math.round(options.width))
    const height = Math.max(16, Math.round(width / cropAspect))
    const fps = Math.max(1, Math.min(30, options.fps))
    const maxColors = Math.max(2, Math.min(256, Math.round(options.maxColors)))
    const frameDelay = Math.round(1000 / fps)
    const frameTimes = buildFrameTimes(start, end, fps, options.reverse, options.bounce)
    const totalFrames = frameTimes.length
    const repeat = gifRepeatCount(options.loop)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Canvas is not available')

    const gif = GIFEncoder()

    for (let i = 0; i < totalFrames; i++) {
      await seekVideo(video, frameTimes[i])
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, width, height)

      const { data } = ctx.getImageData(0, 0, width, height)
      const palette = quantize(data, maxColors, { format: options.colourFormat })
      const index = applyPalette(data, palette, options.colourFormat)

      gif.writeFrame(index, width, height, {
        palette,
        delay: frameDelay,
        dispose: 2,
        ...(i === 0 ? { repeat } : {}),
      })

      onProgress?.({
        frame: i + 1,
        totalFrames,
        ratio: (i + 1) / totalFrames,
      })

      if (i % 3 === 0) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }
    }

    gif.finish()
    const bytes = gif.bytes()
    return new Blob([bytes.slice()], { type: 'image/gif' })
  } finally {
    URL.revokeObjectURL(video.src)
    video.remove()
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
