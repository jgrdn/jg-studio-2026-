/** Shared motion timings — keep in sync with `--motion-*` in index.css */
export const motionTokens = {
  duration: {
    hoverEnter: 0.52,
    hoverLeave: 0.38,
  },
  ease: {
    hoverEnter: 'power2.out',
    hoverLeave: 'power2.inOut',
  },
  scale: {
    cardMedia: 1.045,
    cardMediaAdjacent: 1.03,
    cardTitle: 1.06,
    cardSubtitle: 1.035,
  },
  opacity: {
    cardMediaHover: 0.76,
  },
} as const
