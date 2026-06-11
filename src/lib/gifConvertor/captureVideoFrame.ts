function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Seek failed'))
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

async function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    const tryResolve = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
        cleanup()
        resolve()
      }
    }

    const onError = () => {
      cleanup()
      reject(new Error('Video load failed'))
    }

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', tryResolve)
      video.removeEventListener('loadeddata', tryResolve)
      video.removeEventListener('canplay', tryResolve)
      video.removeEventListener('error', onError)
    }

    video.addEventListener('loadedmetadata', tryResolve)
    video.addEventListener('loadeddata', tryResolve)
    video.addEventListener('canplay', tryResolve)
    video.addEventListener('error', onError, { once: true })

    tryResolve()

    if (video.networkState === HTMLMediaElement.NETWORK_EMPTY && video.src) {
      video.load()
    }
  })
}

/** Small JPEG data URL for ambient backgrounds — not full resolution. */
export async function captureVideoPoster(
  video: HTMLVideoElement,
  time = 0,
  maxWidth = 720,
): Promise<string | null> {
  await waitForVideoReady(video)

  const sourceWidth = video.videoWidth
  const sourceHeight = video.videoHeight
  if (!sourceWidth || !sourceHeight) return null

  const duration = video.duration
  const seekTime =
    Number.isFinite(duration) && duration > 0
      ? Math.min(Math.max(0, time), Math.max(0, duration - 0.001))
      : 0

  try {
    await seekVideo(video, seekTime)
  } catch {
    if (seekTime > 0) {
      await seekVideo(video, 0)
    }
  }

  const scale = Math.min(1, maxWidth / sourceWidth)
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, width, height)

  try {
    return canvas.toDataURL('image/jpeg', 0.55)
  } catch {
    return null
  }
}
