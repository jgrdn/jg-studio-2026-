import { clampCrop, fullCrop, type AspectRatioPreset, type NormalizedCrop } from './crop'
import type { GifColourFormat, GifLoopMode } from './convertVideoToGif'

const STORAGE_KEY = 'jg-gif-convertor-settings'
const VERSION = 2

const ASPECT_IDS: AspectRatioPreset[] = [
  'source',
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '4:5',
  '21:9',
  'custom',
  'free',
]

const LOOP_PRESET_VALUES: (GifLoopMode | 'custom')[] = [-1, 0, 2, 3, 5, 10, 'custom']

export type GifConvertorCachedSettings = {
  fps: number
  width: number
  maxColors: number
  colourFormat: GifColourFormat
  aspectPreset: AspectRatioPreset
  customAspectW: number
  customAspectH: number
  crop: NormalizedCrop
  reverse: boolean
  bounce: boolean
  loopPreset: GifLoopMode | 'custom'
  loopCustom: number
}

export const GIF_CONVERTOR_DEFAULTS: GifConvertorCachedSettings = {
  fps: 12,
  width: 480,
  maxColors: 128,
  colourFormat: 'rgb565',
  aspectPreset: 'source',
  customAspectW: 16,
  customAspectH: 9,
  crop: fullCrop(),
  reverse: false,
  bounce: false,
  loopPreset: 0,
  loopCustom: 4,
}

type Stored = GifConvertorCachedSettings & { v: number }

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.round(n)))
}

function parseCrop(raw: unknown): NormalizedCrop {
  if (!raw || typeof raw !== 'object') return fullCrop()
  const c = raw as Partial<NormalizedCrop>
  return clampCrop({
    x: typeof c.x === 'number' ? c.x : 0,
    y: typeof c.y === 'number' ? c.y : 0,
    w: typeof c.w === 'number' ? c.w : 1,
    h: typeof c.h === 'number' ? c.h : 1,
  })
}

function parseStored(raw: unknown): GifConvertorCachedSettings {
  if (!raw || typeof raw !== 'object') return { ...GIF_CONVERTOR_DEFAULTS, crop: fullCrop() }

  const data = raw as Partial<Stored>
  if (data.v !== VERSION) return { ...GIF_CONVERTOR_DEFAULTS, crop: fullCrop() }

  const colourFormat: GifColourFormat = data.colourFormat === 'rgb444' ? 'rgb444' : 'rgb565'
  const aspectPreset = ASPECT_IDS.includes(data.aspectPreset as AspectRatioPreset)
    ? (data.aspectPreset as AspectRatioPreset)
    : 'source'

  let loopPreset: GifLoopMode | 'custom' = 0
  if (LOOP_PRESET_VALUES.includes(data.loopPreset as GifLoopMode | 'custom')) {
    loopPreset = data.loopPreset as GifLoopMode | 'custom'
  }

  return {
    fps: clampInt(data.fps, 1, 30, GIF_CONVERTOR_DEFAULTS.fps),
    width: clampInt(data.width, 120, 1920, GIF_CONVERTOR_DEFAULTS.width),
    maxColors: clampInt(data.maxColors, 8, 256, GIF_CONVERTOR_DEFAULTS.maxColors),
    colourFormat,
    aspectPreset,
    customAspectW: clampInt(data.customAspectW, 1, 9999, GIF_CONVERTOR_DEFAULTS.customAspectW),
    customAspectH: clampInt(data.customAspectH, 1, 9999, GIF_CONVERTOR_DEFAULTS.customAspectH),
    crop: parseCrop(data.crop),
    reverse: Boolean(data.reverse),
    bounce: Boolean(data.bounce),
    loopPreset,
    loopCustom: clampInt(data.loopCustom, 1, 99, GIF_CONVERTOR_DEFAULTS.loopCustom),
  }
}

export function loadGifConvertorSettings(): GifConvertorCachedSettings {
  if (typeof window === 'undefined') {
    return { ...GIF_CONVERTOR_DEFAULTS, crop: fullCrop() }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...GIF_CONVERTOR_DEFAULTS, crop: fullCrop() }
    return parseStored(JSON.parse(raw))
  } catch {
    return { ...GIF_CONVERTOR_DEFAULTS, crop: fullCrop() }
  }
}

export function saveGifConvertorSettings(settings: GifConvertorCachedSettings): void {
  if (typeof window === 'undefined') return

  const payload: Stored = {
    v: VERSION,
    fps: clampInt(settings.fps, 1, 30, GIF_CONVERTOR_DEFAULTS.fps),
    width: clampInt(settings.width, 120, 1920, GIF_CONVERTOR_DEFAULTS.width),
    maxColors: clampInt(settings.maxColors, 8, 256, GIF_CONVERTOR_DEFAULTS.maxColors),
    colourFormat: settings.colourFormat === 'rgb444' ? 'rgb444' : 'rgb565',
    aspectPreset: ASPECT_IDS.includes(settings.aspectPreset) ? settings.aspectPreset : 'source',
    customAspectW: clampInt(settings.customAspectW, 1, 9999, GIF_CONVERTOR_DEFAULTS.customAspectW),
    customAspectH: clampInt(settings.customAspectH, 1, 9999, GIF_CONVERTOR_DEFAULTS.customAspectH),
    crop: clampCrop(settings.crop),
    reverse: Boolean(settings.reverse),
    bounce: settings.reverse ? false : Boolean(settings.bounce),
    loopPreset: LOOP_PRESET_VALUES.includes(settings.loopPreset) ? settings.loopPreset : 0,
    loopCustom: clampInt(settings.loopCustom, 1, 99, GIF_CONVERTOR_DEFAULTS.loopCustom),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}
