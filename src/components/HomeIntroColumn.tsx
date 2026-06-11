import type { ReactNode } from 'react'

/** Home left column: reserves space for the fixed nav, then page content. */
export function HomeIntroColumn({ children }: { children: ReactNode }) {
  return (
    <div className="home-sidebar">
      <div className="nav-shell-spacer" aria-hidden />
      <div className="home-sidebar__body">{children}</div>
    </div>
  )
}
