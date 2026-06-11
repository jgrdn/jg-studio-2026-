import gsap from 'gsap'

const DESKTOP_MQ = '(min-width: 960px)'

/**
 * Subtle scrub on the whole rich-text block (not just the heading),
 * similar vibe to the recognition title scrub but applied to copy.
 */
export function initProjectTextScrub(root: ParentNode): () => void {
  if (!window.matchMedia(DESKTOP_MQ).matches) return () => {}

  const tweens: gsap.core.Tween[] = []

  root
    .querySelectorAll<HTMLElement>(
      '.project-two-col .project-col--text .project-rich-text, .project-three-col .project-col--text .project-rich-text',
    )
    .forEach((block) => {
      const section = block.closest<HTMLElement>('.project-two-col, .project-three-col')
      if (!section) return

      const tween = gsap.fromTo(
        block,
        { y: 18 },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            end: 'top 52%',
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        },
      )

      tweens.push(tween)
    })

  return () => {
    tweens.forEach((t) => {
      t.scrollTrigger?.kill()
      t.kill()
    })
  }
}

