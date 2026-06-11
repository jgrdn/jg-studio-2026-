import type { CSSProperties } from 'react'
import type { MediaItem } from '../../content/projects/types'

function aspectToStyle(aspect?: string): CSSProperties | undefined {
  if (!aspect || aspect === 'auto') return undefined
  return { aspectRatio: aspect }
}

export function renderMediaItem(item: MediaItem, className: string, key?: string) {
  const k = key ?? ('kind' in item && item.kind === 'fill' ? item.gradient : 'src' in item ? item.src : 'media')

  if (item.kind === 'fill') {
    return (
      <div
        key={k}
        className={`${className} project-media__el--fill`.trim()}
        style={{
          ...aspectToStyle(item.aspect),
          backgroundImage: item.gradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        role="img"
        aria-hidden
      />
    )
  }

  if (item.kind === 'video') {
    return (
      <video
        key={k}
        className={className}
        style={aspectToStyle(item.aspect)}
        src={item.src}
        playsInline
        controls
      />
    )
  }

  return (
    <img
      key={k}
      className={className}
      style={aspectToStyle(item.aspect)}
      src={item.src}
      alt={item.alt ?? ''}
      loading="lazy"
      decoding="async"
    />
  )
}
