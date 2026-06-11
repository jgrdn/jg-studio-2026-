import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { DependencyList } from 'react'
import type { RefObject } from 'react'

type UseGsapOptions = {
  scope?: RefObject<HTMLElement | null>
  deps?: DependencyList
  revertOnUpdate?: boolean
}

/**
 * Thin wrapper so the project uses one GSAP pattern everywhere.
 * - pass `scope` to auto-scope selectors
 * - pass `deps` to re-run in a predictable way
 */
export function useGsap(
  fn: (context: gsap.Context) => void | (() => void),
  { scope, deps = [], revertOnUpdate = true }: UseGsapOptions = {},
) {
  return useGSAP(() => fn(gsap.context(() => undefined, scope?.current ?? undefined)), {
    scope: scope?.current ?? undefined,
    dependencies: [...deps],
    revertOnUpdate,
  })
}

