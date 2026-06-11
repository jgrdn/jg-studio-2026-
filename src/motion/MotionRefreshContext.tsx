import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type MotionRefreshValue = {
  generation: number
  bump: () => void
  /** Route shown in the shell (marquee etc.) — updates after exit, not on click. */
  displayPath: string
  setDisplayPath: (path: string) => void
}

const MotionRefreshContext = createContext<MotionRefreshValue | null>(null)

export function MotionRefreshProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [generation, setGeneration] = useState(0)
  const [displayPath, setDisplayPath] = useState(pathname)
  const bump = useCallback(() => setGeneration((g) => g + 1), [])
  const value = useMemo(
    () => ({ generation, bump, displayPath, setDisplayPath }),
    [generation, bump, displayPath],
  )
  return (
    <MotionRefreshContext.Provider value={value}>{children}</MotionRefreshContext.Provider>
  )
}

export function useMotionRefresh() {
  const ctx = useContext(MotionRefreshContext)
  if (!ctx) {
    throw new Error('useMotionRefresh must be used within MotionRefreshProvider')
  }
  return ctx
}
