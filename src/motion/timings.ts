export const motion = {
  ease: {
    /** Good default for UI — not bouncy, not robotic */
    standard: [0.2, 0.8, 0.2, 1] as const,
    /** Snappier “enter” */
    out: [0.16, 1, 0.3, 1] as const,
    /** Subtle settle */
    inOut: [0.4, 0, 0.2, 1] as const,
  },
  duration: {
    xs: 0.14,
    sm: 0.22,
    md: 0.32,
    lg: 0.48,
    xl: 0.72,
  },
} as const

