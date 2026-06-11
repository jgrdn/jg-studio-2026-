type IconProps = { className?: string }

export function IconGrid2({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect x="2" y="3" width="6" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <rect x="10" y="3" width="6" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function IconGrid3({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect x="1.5" y="3" width="4" height="12" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1.15" />
      <rect x="7" y="3" width="4" height="12" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1.15" />
      <rect x="12.5" y="3" width="4" height="12" rx="0.75" fill="none" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  )
}

export function IconGrid4({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      {[1.5, 5.5, 9.5, 13.5].map((x) => (
        <rect
          key={x}
          x={x}
          y="3"
          width="3"
          height="12"
          rx="0.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      ))}
    </svg>
  )
}

export function IconRatio45({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect x="4" y="2.5" width="10" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function IconRatio54({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect x="2" y="5" width="14" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function IconRatio11({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <rect x="3.5" y="3.5" width="11" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export function IconFilter({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M2.5 4h13M5 9h8M7.5 14h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconClear({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M5 5l8 8M13 5l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
