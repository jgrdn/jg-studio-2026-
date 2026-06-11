import { useCallback, useEffect, useRef, useState } from 'react'
import {
  aspectRatioValue,
  clampCrop,
  cropCenter,
  fitCropToAspect,
  type AspectRatioPreset,
  type NormalizedCrop,
} from '../lib/gifConvertor/crop'
import type { GifColourFormat, GifLoopMode } from '../lib/gifConvertor/convertVideoToGif'
import {
  GIF_CONVERTOR_DEFAULTS,
  loadGifConvertorSettings,
  saveGifConvertorSettings,
  type GifConvertorCachedSettings,
} from '../lib/gifConvertor/settingsCache'

function readInitial(): GifConvertorCachedSettings {
  return loadGifConvertorSettings()
}

export function useGifConvertorSettings() {
  const initial = useRef(readInitial()).current

  const [fps, setFps] = useState(initial.fps)
  const [width, setWidth] = useState(initial.width)
  const [maxColors, setMaxColors] = useState(initial.maxColors)
  const [colourFormat, setColourFormat] = useState<GifColourFormat>(initial.colourFormat)
  const [aspectPreset, setAspectPreset] = useState<AspectRatioPreset>(initial.aspectPreset)
  const [customAspectW, setCustomAspectW] = useState(initial.customAspectW)
  const [customAspectH, setCustomAspectH] = useState(initial.customAspectH)
  const [crop, setCrop] = useState<NormalizedCrop>(initial.crop)
  const [reverse, setReverse] = useState(initial.reverse)
  const [bounce, setBounce] = useState(initial.bounce)
  const [loopPreset, setLoopPreset] = useState<GifLoopMode | 'custom'>(initial.loopPreset)
  const [loopCustom, setLoopCustom] = useState(initial.loopCustom)

  const snapshotRef = useRef<GifConvertorCachedSettings>(initial)

  useEffect(() => {
    const next: GifConvertorCachedSettings = {
      fps,
      width,
      maxColors,
      colourFormat,
      aspectPreset,
      customAspectW,
      customAspectH,
      crop,
      reverse,
      bounce,
      loopPreset,
      loopCustom,
    }
    snapshotRef.current = next

    const id = window.setTimeout(() => saveGifConvertorSettings(next), 280)
    return () => window.clearTimeout(id)
  }, [
    fps,
    width,
    maxColors,
    colourFormat,
    aspectPreset,
    customAspectW,
    customAspectH,
    crop,
    reverse,
    bounce,
    loopPreset,
    loopCustom,
  ])

  const applyToVideo = useCallback((videoWidth: number, videoHeight: number) => {
    const s = snapshotRef.current
    const safeWidth = Math.min(Math.max(120, s.width), videoWidth)

    setWidth(safeWidth)
    setAspectPreset(s.aspectPreset)
    setCustomAspectW(s.customAspectW)
    setCustomAspectH(s.customAspectH)

    if (s.aspectPreset === 'free') {
      setCrop(clampCrop(s.crop))
      return
    }

    const aspect = aspectRatioValue(
      s.aspectPreset,
      videoWidth,
      videoHeight,
      s.customAspectW,
      s.customAspectH,
    )
    const center = cropCenter(s.crop)
    setCrop(fitCropToAspect(videoWidth, videoHeight, aspect, center.x, center.y))
  }, [])

  const resetToDefaults = useCallback(() => {
    const d = { ...GIF_CONVERTOR_DEFAULTS, crop: { ...GIF_CONVERTOR_DEFAULTS.crop } }
    setFps(d.fps)
    setWidth(d.width)
    setMaxColors(d.maxColors)
    setColourFormat(d.colourFormat)
    setAspectPreset(d.aspectPreset)
    setCustomAspectW(d.customAspectW)
    setCustomAspectH(d.customAspectH)
    setCrop(d.crop)
    setReverse(d.reverse)
    setBounce(d.bounce)
    setLoopPreset(d.loopPreset)
    setLoopCustom(d.loopCustom)
    saveGifConvertorSettings(d)
  }, [])

  return {
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
  }
}
