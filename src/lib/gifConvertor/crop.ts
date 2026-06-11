export type AspectRatioPreset =
  | 'source'
  | '1:1'
  | '16:9'
  | '9:16'
  | '4:3'
  | '3:4'
  | '4:5'
  | '21:9'
  | 'custom'
  | 'free'

export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export type NormalizedCrop = {
  /** 0–1 from left */
  x: number
  /** 0–1 from top */
  y: number
  /** 0–1 width */
  w: number
  /** 0–1 height */
  h: number
}

export const ASPECT_PRESETS: { id: AspectRatioPreset; label: string }[] = [
  { id: 'source', label: 'Original' },
  { id: '1:1', label: '1∶1' },
  { id: '16:9', label: '16∶9' },
  { id: '9:16', label: '9∶16' },
  { id: '4:3', label: '4∶3' },
  { id: '3:4', label: '3∶4' },
  { id: '4:5', label: '4∶5' },
  { id: '21:9', label: '21∶9' },
  { id: 'custom', label: 'Custom' },
  { id: 'free', label: 'Free' },
]

const MIN_CROP_FRAC = 0.05

export function parseCustomAspectRatio(customW: number, customH: number): number {
  const w = Math.max(1, Math.round(customW))
  const h = Math.max(1, Math.round(customH))
  return w / h
}

export function aspectRatioValue(
  preset: AspectRatioPreset,
  sourceW: number,
  sourceH: number,
  customW = 16,
  customH = 9,
): number {
  if (preset === 'source' || preset === 'free') return sourceW / sourceH
  if (preset === 'custom') return parseCustomAspectRatio(customW, customH)
  const [a, b] = preset.split(':').map(Number)
  return a / b
}

export function cropPixelSize(crop: NormalizedCrop, sourceW: number, sourceH: number) {
  return {
    width: Math.max(1, Math.round(crop.w * sourceW)),
    height: Math.max(1, Math.round(crop.h * sourceH)),
  }
}

/** Slightly inset crop so corner handles are visible when entering free crop. */
export function defaultEditableCrop(): NormalizedCrop {
  const inset = 0.08
  return clampCrop({ x: inset, y: inset, w: 1 - inset * 2, h: 1 - inset * 2 })
}

export function isFullFrameCrop(crop: NormalizedCrop): boolean {
  return crop.x <= 0.01 && crop.y <= 0.01 && crop.w >= 0.98 && crop.h >= 0.98
}

/** Largest crop of `aspect` that fits inside the source frame. */
export function fitCropToAspect(
  sourceW: number,
  sourceH: number,
  aspect: number,
  centerX = 0.5,
  centerY = 0.5,
): NormalizedCrop {
  const sourceAspect = sourceW / sourceH
  let w: number
  let h: number

  if (aspect >= sourceAspect) {
    w = 1
    h = sourceAspect / aspect
  } else {
    h = 1
    w = aspect / sourceAspect
  }

  return clampCrop({
    x: centerX - w / 2,
    y: centerY - h / 2,
    w,
    h,
  })
}

export function clampCrop(crop: NormalizedCrop): NormalizedCrop {
  const w = Math.max(MIN_CROP_FRAC, Math.min(1, crop.w))
  const h = Math.max(MIN_CROP_FRAC, Math.min(1, crop.h))
  const x = Math.max(0, Math.min(1 - w, crop.x))
  const y = Math.max(0, Math.min(1 - h, crop.y))
  return { x, y, w, h }
}

function toPixels(crop: NormalizedCrop, sourceW: number, sourceH: number) {
  return {
    x: crop.x * sourceW,
    y: crop.y * sourceH,
    w: crop.w * sourceW,
    h: crop.h * sourceH,
  }
}

function fromPixels(
  x: number,
  y: number,
  w: number,
  h: number,
  sourceW: number,
  sourceH: number,
): NormalizedCrop {
  return clampCrop({
    x: x / sourceW,
    y: y / sourceH,
    w: w / sourceW,
    h: h / sourceH,
  })
}

function clampPx(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

/** Resize crop; `lockAspect` null keeps the dragged proportions (free crop). */
export function resizeCrop(
  crop: NormalizedCrop,
  handle: CropHandle,
  dx: number,
  dy: number,
  lockAspect: number | null,
  sourceW: number,
  sourceH: number,
): NormalizedCrop {
  const dPx = dx * sourceW
  const dPy = dy * sourceH
  const box = toPixels(crop, sourceW, sourceH)
  const minW = MIN_CROP_FRAC * sourceW
  const minH = MIN_CROP_FRAC * sourceH

  const left0 = box.x
  const top0 = box.y
  const right0 = box.x + box.w
  const bottom0 = box.y + box.h

  let left = left0
  let top = top0
  let right = right0
  let bottom = bottom0

  if (handle.includes('w')) left = left0 + dPx
  if (handle.includes('e')) right = right0 + dPx
  if (handle.includes('n')) top = top0 + dPy
  if (handle.includes('s')) bottom = bottom0 + dPy

  if (right < left) [left, right] = [right, left]
  if (bottom < top) [top, bottom] = [bottom, top]

  let w = right - left
  let h = bottom - top

  if (w < minW) {
    if (handle.includes('w')) left = right - minW
    else right = left + minW
    w = right - left
  }
  if (h < minH) {
    if (handle.includes('n')) top = bottom - minH
    else bottom = top + minH
    h = bottom - top
  }

  if (lockAspect != null) {
    const anchorX = handle.includes('w') ? right0 : left0
    const anchorY = handle.includes('n') ? bottom0 : top0

    if (handle === 'e' || handle === 'w') {
      h = w / lockAspect
      top = handle === 'w' ? bottom - h : top0
      bottom = top + h
      left = handle === 'w' ? anchorX - w : left0
      right = left + w
    } else if (handle === 'n' || handle === 's') {
      w = h * lockAspect
      left = handle === 'n' ? right - w : left0
      right = left + w
      top = handle === 'n' ? anchorY - h : top0
      bottom = top + h
    } else {
      const movingX = handle.includes('w') ? left0 + dPx : right0 + dPx
      const movingY = handle.includes('n') ? top0 + dPy : bottom0 + dPy
      w = Math.abs(movingX - anchorX)
      h = Math.abs(movingY - anchorY)
      if (Math.abs(dPx) >= Math.abs(dPy)) h = w / lockAspect
      else w = h * lockAspect
      w = Math.max(minW, w)
      h = Math.max(minH, h)
      left = handle.includes('w') ? anchorX - w : anchorX
      top = handle.includes('n') ? anchorY - h : anchorY
      right = left + w
      bottom = top + h
    }
  }

  left = clampPx(left, 0, sourceW - minW)
  top = clampPx(top, 0, sourceH - minH)
  right = clampPx(right, left + minW, sourceW)
  bottom = clampPx(bottom, top + minH, sourceH)
  w = right - left
  h = bottom - top

  if (lockAspect != null) {
    if (w / h > lockAspect) w = h * lockAspect
    else h = w / lockAspect
    w = Math.max(minW, w)
    h = Math.max(minH, h)
    if (handle.includes('w')) left = right - w
    if (handle.includes('n')) top = bottom - h
    if (left < 0) {
      left = 0
      right = w
    }
    if (top < 0) {
      top = 0
      bottom = h
    }
    if (right > sourceW) {
      right = sourceW
      left = right - w
    }
    if (bottom > sourceH) {
      bottom = sourceH
      top = bottom - h
    }
  }

  return fromPixels(left, top, right - left, bottom - top, sourceW, sourceH)
}

export function cropCenter(crop: NormalizedCrop) {
  return { x: crop.x + crop.w / 2, y: crop.y + crop.h / 2 }
}

export function moveCrop(crop: NormalizedCrop, dx: number, dy: number): NormalizedCrop {
  return clampCrop({
    ...crop,
    x: crop.x + dx,
    y: crop.y + dy,
  })
}

export function fullCrop(): NormalizedCrop {
  return { x: 0, y: 0, w: 1, h: 1 }
}
