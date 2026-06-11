import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useMotionRefresh } from '../motion/MotionRefreshContext'
import gsap from 'gsap'
import { ScrollTrigger } from '../motion/gsapPlugins'
import { projects } from '../content/site'
import {
  DEFAULT_AMBIENT,
  applyAmbientToneToRoot,
  projectHeroImageSrc,
  readAmbientFromRoot,
  resolveProjectAmbientTone,
  type AmbientTone,
} from '../motion/ambientTone'
import { usePrefersReducedMotion } from '../motion/usePrefersReducedMotion'

const TRANSITION = {
  duration: 0.95,
  ease: 'power2.inOut',
} as const

const AMBIENT_VARS = [
  '--ambient-base',
  '--ambient-glow-a',
  '--ambient-glow-b',
  '--ambient-glow-opacity',
] as const

function isProjectPath(pathname: string): boolean {
  return /^\/work\/[^/]+/.test(pathname)
}

function animateTone(target: AmbientTone, duration: number) {
  const root = document.documentElement
  const from = readAmbientFromRoot()

  gsap.killTweensOf(root, AMBIENT_VARS)

  if (duration <= 0) {
    applyAmbientToneToRoot(target)
    return
  }

  gsap.fromTo(
    root,
    {
      '--ambient-base': from.base,
      '--ambient-glow-a': from.glowA,
      '--ambient-glow-b': from.glowB,
      '--ambient-glow-opacity': from.glowOpacity,
    },
    {
      '--ambient-base': target.base,
      '--ambient-glow-a': target.glowA,
      '--ambient-glow-b': target.glowB,
      '--ambient-glow-opacity': target.glowOpacity,
      duration,
      ease: TRANSITION.ease,
      overwrite: 'auto',
      onComplete: () => applyAmbientToneToRoot(target),
    },
  )
}

export function ProjectAmbience() {
  const { pathname } = useLocation()
  const { generation } = useMotionRefresh()
  const reduced = usePrefersReducedMotion()
  const requestId = useRef(0)
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const fadeRef = useRef<{
    trigger: ScrollTrigger | null
    tween: gsap.core.Tween | null
  }>({ trigger: null, tween: null })

  useEffect(() => {
    applyAmbientToneToRoot(DEFAULT_AMBIENT)
  }, [])

  useEffect(() => {
    return () => {
      fadeRef.current.trigger?.kill()
      fadeRef.current.tween?.kill()
      fadeRef.current.trigger = null
      fadeRef.current.tween = null
    }
  }, [])

  useEffect(() => {
    const path = pathnameRef.current
    const id = ++requestId.current
    const duration = reduced ? 0 : TRANSITION.duration

    const finish = (tone: AmbientTone) => {
      if (id !== requestId.current) return
      animateTone(tone, duration)

      // At the bottom of a project page, fade ambience back to black
      // (feels like you leave the “project zone” before the next/prev cards).
      fadeRef.current.trigger?.kill()
      fadeRef.current.tween?.kill()
      fadeRef.current.trigger = null
      fadeRef.current.tween = null

      if (reduced || tone === DEFAULT_AMBIENT) return

      const main = document.querySelector<HTMLElement>('main.project-page--case')
      if (!main) return

      const root = document.documentElement
      const tween = gsap.to(root, {
        '--ambient-base': DEFAULT_AMBIENT.base,
        '--ambient-glow-a': DEFAULT_AMBIENT.glowA,
        '--ambient-glow-b': DEFAULT_AMBIENT.glowB,
        '--ambient-glow-opacity': DEFAULT_AMBIENT.glowOpacity,
        duration: 1,
        ease: 'none',
        paused: true,
        overwrite: 'auto',
      })

      // Fade back to black as you approach the very bottom:
      // - start when the page bottom is still below the viewport
      // - finish exactly at the bottom (bottom hits bottom)
      const trigger = ScrollTrigger.create({
        trigger: main,
        start: 'bottom 120%',
        end: 'bottom 100%',
        scrub: true,
        onUpdate: (self) => tween.progress(self.progress),
      })

      fadeRef.current.tween = tween
      fadeRef.current.trigger = trigger
    }

    if (!isProjectPath(path)) {
      finish(DEFAULT_AMBIENT)
      return
    }

    const slug = path.split('/')[2]
    const project = projects.find((p) => p.slug === slug)
    if (!project) {
      finish(DEFAULT_AMBIENT)
      return
    }

    const src = projectHeroImageSrc(project)
    void resolveProjectAmbientTone(slug, src).then(finish)
  }, [generation, reduced])

  return (
    <div className="project-ambience" aria-hidden>
      <div className="project-ambience__glow project-ambience__glow--a" />
      <div className="project-ambience__glow project-ambience__glow--b" />
    </div>
  )
}
