import { DEFAULT_THUMBNAIL } from '../content/media'
import type { MediaItem } from '../content/projects/types'
import type { Project } from '../content/site'

export type AmbientTone = {
  base: string
  glowA: string
  glowB: string
  glowOpacity: number
}

export const DEFAULT_AMBIENT: AmbientTone = {
  base: 'rgb(6, 6, 6)',
  glowA: 'rgba(0, 0, 0, 0)',
  glowB: 'rgba(0, 0, 0, 0)',
  glowOpacity: 0,
}

const toneCache = new Map<string, AmbientTone>()

function parseUrlFromCssBackground(value: string): string | null {
  const match = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i)
  return match?.[1] ?? null
}

export function mediaItemImageSrc(item: MediaItem): string {
  if (item.kind === 'fill') return parseUrlFromCssBackground(item.gradient) ?? DEFAULT_THUMBNAIL
  return item.src
}

export function projectHeroImageSrc(project: Project): string {
  const hero = project.blocks.find((b) => b.type === 'projectHero')
  if (hero && hero.type === 'projectHero') return mediaItemImageSrc(hero.background)
  return parseUrlFromCssBackground(project.media) ?? DEFAULT_THUMBNAIL
}

export function readAmbientFromRoot(): AmbientTone {
  const style = getComputedStyle(document.documentElement)
  const opacity = Number.parseFloat(style.getPropertyValue('--ambient-glow-opacity'))
  return {
    base: style.getPropertyValue('--ambient-base').trim() || DEFAULT_AMBIENT.base,
    glowA: style.getPropertyValue('--ambient-glow-a').trim() || DEFAULT_AMBIENT.glowA,
    glowB: style.getPropertyValue('--ambient-glow-b').trim() || DEFAULT_AMBIENT.glowB,
    glowOpacity: Number.isFinite(opacity) ? opacity : DEFAULT_AMBIENT.glowOpacity,
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
  }
  return [h * 360, s * 100, l * 100]
}

function hslToCss(h: number, s: number, l: number, alpha = 1): string {
  const hh = ((h % 360) + 360) % 360
  const ss = Math.max(0, Math.min(100, s)) / 100
  const ll = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = ll - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (hh < 60) {
    rp = c
    gp = x
  } else if (hh < 120) {
    rp = x
    gp = c
  } else if (hh < 180) {
    gp = c
    bp = x
  } else if (hh < 240) {
    gp = x
    bp = c
  } else if (hh < 300) {
    rp = x
    bp = c
  } else {
    rp = c
    bp = x
  }
  const r = Math.round((rp + m) * 255)
  const g = Math.round((gp + m) * 255)
  const b = Math.round((bp + m) * 255)
  return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`
}

function toneFromImage(img: HTMLImageElement): AmbientTone {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return DEFAULT_AMBIENT

  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  let r = 0
  let g = 0
  let b = 0
  let weight = 0

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i]
    const pg = data[i + 1]
    const pb = data[i + 2]
    const lum = 0.2126 * pr + 0.7152 * pg + 0.0722 * pb
    if (lum < 20 || lum > 235) continue
    const sat = Math.max(pr, pg, pb) - Math.min(pr, pg, pb)
    const w = 1 + sat / 72
    r += pr * w
    g += pg * w
    b += pb * w
    weight += w
  }

  if (weight === 0) return DEFAULT_AMBIENT

  r /= weight
  g /= weight
  b /= weight

  const [h, s] = rgbToHsl(r, g, b)

  return {
    base: hslToCss(h, Math.min(s * 0.38, 30), 7),
    glowA: hslToCss(h, Math.min(s * 0.48, 36), 16, 0.55),
    glowB: hslToCss((h + 28) % 360, Math.min(s * 0.34, 26), 11, 0.45),
    glowOpacity: 0.28,
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

export async function resolveProjectAmbientTone(slug: string, src: string): Promise<AmbientTone> {
  const cached = toneCache.get(slug)
  if (cached) return cached

  try {
    const img = await loadImage(src)
    const tone = toneFromImage(img)
    toneCache.set(slug, tone)
    return tone
  } catch {
    return DEFAULT_AMBIENT
  }
}

export function applyAmbientToneToRoot(tone: AmbientTone) {
  const root = document.documentElement
  root.style.setProperty('--ambient-base', tone.base)
  root.style.setProperty('--ambient-glow-a', tone.glowA)
  root.style.setProperty('--ambient-glow-b', tone.glowB)
  root.style.setProperty('--ambient-glow-opacity', String(tone.glowOpacity))
}
