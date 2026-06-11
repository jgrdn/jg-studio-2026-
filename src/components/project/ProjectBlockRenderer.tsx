import type { ProjectBlock } from '../../content/projects/types'
import { ProjectAdjacentCards } from './ProjectAdjacentCards'
import { ProjectCarousel } from './ProjectCarousel'
import { ProjectHeroFull } from './ProjectHeroFull'
import { ProjectMedia } from './ProjectMedia'
import { ProjectMasonry } from './ProjectMasonry'
import { ProjectRichText } from './ProjectRichText'
import { ProjectThreeCol } from './ProjectThreeCol'
import { ProjectTwoCol } from './ProjectTwoCol'
import { ProjectTwoUp } from './ProjectTwoUp'

export function ProjectBlockRenderer({ block }: { block: ProjectBlock }) {
  switch (block.type) {
    case 'projectHero':
      return (
        <ProjectHeroFull
          background={block.background}
          headline={block.headline}
          subline={block.subline}
          body={block.body}
          meta={block.meta}
        />
      )
    case 'twoUp':
      return <ProjectTwoUp left={block.left} right={block.right} />
    case 'carousel':
      return <ProjectCarousel items={block.items} layout={block.layout} />
    case 'fullWidthMedia':
      return (
        <ProjectMedia
          items={block.items}
          caption={block.caption}
          variant={block.variant ?? 'default'}
          shell={block.shell ?? 'grid'}
        />
      )
    case 'twoCol':
      return <ProjectTwoCol layout={block.layout} left={block.left} right={block.right} />
    case 'threeCol':
      return <ProjectThreeCol left={block.left} middle={block.middle} right={block.right} />
    case 'adjacentProjects':
      return <ProjectAdjacentCards prev={block.prev} next={block.next} />
    case 'richText':
      return <ProjectRichText eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
    case 'masonry':
      return <ProjectMasonry items={block.items} />
    default:
      return null
  }
}
