declare module 'gifenc' {
  export type GifColourFormat = 'rgb565' | 'rgb444' | 'rgba4444'

  export type QuantizeOptions = {
    format?: GifColourFormat
    oneBitAlpha?: boolean | number
    clearAlpha?: boolean
    clearAlphaThreshold?: number
    clearAlphaColor?: number
  }

  export type WriteFrameOptions = {
    palette?: number[][]
    first?: boolean
    transparent?: boolean
    transparentIndex?: number
    delay?: number
    repeat?: number
    colorDepth?: number
    dispose?: number
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions,
  ): number[][]

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: GifColourFormat,
  ): Uint8Array

  export function GIFEncoder(opt?: { initialCapacity?: number; auto?: boolean }): {
    reset(): void
    finish(): void
    bytes(): Uint8Array
    writeFrame(index: Uint8Array, width: number, height: number, opts?: WriteFrameOptions): void
  }
}
