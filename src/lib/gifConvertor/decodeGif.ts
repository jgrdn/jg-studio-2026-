export type GifFrame = {
  bitmap: ImageBitmap
  delayMs: number
  /** Start time of this frame in seconds */
  time: number
}

export type DecodedGif = {
  width: number
  height: number
  duration: number
  frames: GifFrame[]
}

export function gifFrameIndexAtTime(frames: GifFrame[], time: number): number {
  if (!frames.length) return 0
  let index = 0
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].time <= time + 0.0001) index = i
    else break
  }
  return index
}

export async function decodeGifFile(file: File): Promise<DecodedGif> {
  if (typeof ImageDecoder === 'undefined') {
    throw new Error('GIF import is not supported in this browser. Try a recent Chrome or Safari.')
  }

  const decoder = new ImageDecoder({
    data: await file.arrayBuffer(),
    type: 'image/gif',
  })

  try {
    await decoder.tracks.ready
    const track = decoder.tracks.selectedTrack
    if (!track?.frameCount) {
      throw new Error('GIF has no frames')
    }

    const frames: GifFrame[] = []
    let time = 0

    for (let i = 0; i < track.frameCount; i++) {
      const { image } = await decoder.decode({ frameIndex: i })
      const delayMs = Math.max(20, (image.duration ?? 100_000) / 1000)
      const bitmap = await createImageBitmap(image)
      image.close()

      frames.push({ bitmap, delayMs, time })
      time += delayMs / 1000
    }

    const width = frames[0]?.bitmap.width ?? 0
    const height = frames[0]?.bitmap.height ?? 0
    if (!width || !height) {
      throw new Error('GIF has no readable dimensions')
    }

    return { width, height, duration: time, frames }
  } finally {
    decoder.close()
  }
}

export function closeDecodedGif(decoded: DecodedGif): void {
  for (const frame of decoded.frames) {
    frame.bitmap.close()
  }
}
