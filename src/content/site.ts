import { caseStudyBlocks, type AdjacentSummary } from './projects/caseStudyTemplate'
import {
  DEFAULT_THUMBNAIL,
  PROJECT_IMAGES,
  PROJECT_VIDEOS,
  SITE_OG_IMAGE,
  defaultThumbnailBg,
  projectThumbnailBg,
} from './media'

/** Google Analytics 4 measurement ID */
export const GA_MEASUREMENT_ID = 'G-7LD8T5676Y'

export const site = {
  name: 'Joey Gordon',
  email: 'joey@jg.studio',
  linkedInUrl: 'https://www.linkedin.com/in/joeygordon/',
  /** Poster / fallback still while the reel file is prepared */
  heroImage: DEFAULT_THUMBNAIL,
  /** MP4 URL — poster (`heroImage`) used until loaded; empty string shows image only */
  heroVideo: '/hero-reel.mp4',
  intro:
    "I'm an Executive Design Director with almost twenty years of experience shaping brands, products, and digital experiences alongside both global and independent studios. I started out hands-on, which is how I lead today. I stay involved in the craft of brand, advertising, and development, working directly with teams throughout our journey.",
  aboutParagraphs: [
    "My work brings together strategy, design, and execution. I've led brand builds, digital platforms, rebrands, and product experiences for global accounts and fast-moving businesses in the UK, USA, EMEA, and APAC. My experience includes brand identity, advertising, digital and web, product, motion, and campaign. I see everything as part of a single, connected system that helps brands stand out in the real world.",
    "With AI and generative tools, good judgment is absolutely key. When used well, these tools expand what's possible and help teams move faster. On the flip side, if used poorly, they can harm creativity and lead to slop - you know the kind. I use these tools in my workflow as ways to explore, test, and speed up work, always keeping human taste and curation at the center of every decision.",
    'I believe in calm, clear thinking and high standards - without the ego. Quality is about people raising the bar while helping others raise theirs. I build senior teams, mentor designers, and stay close to the work when it matters, to make sure the idea stays strong, and the details hold up from concept to build.',
    "I work closely with founders, executives, and product leaders, taking time to understand their world before offering solutions. Business challenges become clear design frameworks and experiences that people can understand. I'm comfortable working at the board level, explaining these design decisions, trade-offs, and impact in plain language.",
    "I'm a strategic designer, a builder, and a leader who stays on the craft so I can keep proud, long after it ships.",
  ],
} as const

export const agencyStrip = [
  'VML',
  'HAVAS',
  'true',
  "ST LUKE'S",
  'Ogilvy',
  'make',
  'MBA >',
  'STORM BRANDS',
] as const

export const brands = [
  'Adobe',
  'Aero',
  'Auto Finesse',
  'Auto Trader',
  'Boots',
  'Camel',
  'Canesten',
  'Coca-Cola',
  'Carlsberg',
  'Click-On',
  'Click Travel',
  'Costa',
  'Coutts',
  'Diageo',
  'Disney',
  'Fanta',
  'Generali',
  'Google Gemini',
  'HSBC',
  'Interflora',
  'Katherine Hooker',
  'Kaspersky',
  'KitKat',
  'Lego',
  'Logitech',
  'Marvel',
  'Natwest',
  'Nespresso',
  'Oasis',
  'Pergraphica',
  'PIF',
  'Premier League',
  'Podcastle',
  'Royal Canin',
  'Shell',
  'Stjärnagloss',
  'Sunsilk',
  'Sure / Rexona',
  'Talksport',
  'Tanqueray',
  'Tesco',
  'Unmind',
  'U-Switch',
  'Volkswagen',
  'Vuse',
] as const

export type Project = {
  slug: string
  title: string
  subtitle: string
  summary: string
  tags: string[]
  status?: 'coming-soon'
  /** CSS `background-image` (url or gradient) for cards and heroes */
  media: string
  /** Card preview video — plays on hover, pauses on leave */
  thumbnailVideo?: string
  ogImage?: string
  blocks: import('./projects/types').ProjectBlock[]
}

type ProjectDefinition = Omit<Project, 'blocks'> & {
  /** Optional hero title when it should differ from the project title */
  heroHeadline?: string
  /** Image path for case-study placeholder blocks */
  thumbnailSrc?: string
}

const projectDefinitions: ProjectDefinition[] = [
  {
    slug: 'jaguar',
    title: 'Jaguar',
    subtitle: 'Coming soon',
    summary: 'Launch and campaign work. Full case study coming soon.',
    tags: ['Launch', 'Campaign', 'Coming soon'],
    status: 'coming-soon',
    media: projectThumbnailBg(PROJECT_IMAGES.jaguar),
    thumbnailSrc: PROJECT_IMAGES.jaguar,
  },
  {
    slug: 'podcastle',
    title: 'Podcastle',
    subtitle: '#1 AI Studio',
    summary: 'Brand and product storytelling for a next-gen AI audio studio.',
    tags: ['Product', 'Brand', 'AI'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'seraphim',
    title: 'Seraphim',
    subtitle: 'We are generation space',
    summary: 'Brand narrative and campaign work for a new era of space investment.',
    tags: ['Brand', 'Campaign', 'Space'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'boots',
    title: 'Boots',
    subtitle: 'Joy for all',
    summary: 'Seasonal campaign concepting and execution across digital and retail.',
    tags: ['Campaign', 'Brand', 'Retail'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'coca-cola-premier-league',
    title: 'Coca-Cola × Premier League',
    subtitle: 'Taste Every Second',
    summary: 'Campaign direction for a major sports partnership.',
    tags: ['Campaign', 'Brand', 'Sport'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'tiktok',
    title: 'TikTok',
    subtitle: 'TikTok for Business',
    summary: 'B2B brand and platform storytelling for TikTok for Business.',
    tags: ['Brand', 'B2B', 'Platform'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'katherine-hooker',
    title: 'Katherine Hooker',
    subtitle: 'Made in London',
    summary: 'Luxury e-commerce and brand craft for a London atelier.',
    tags: ['Brand', 'E-comm', 'Luxury'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'generali',
    title: 'Generali',
    subtitle: 'Here Now',
    summary: 'Campaign work for Generali focused on presence and momentum.',
    tags: ['Campaign', 'Brand', 'Insurance'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'salient-bio',
    title: 'Salient Bio',
    subtitle: 'Website build',
    summary: 'Website build bringing clarity to a complex biotech story.',
    tags: ['Web', 'UI / UX', 'Health'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'seth-and-rileys',
    title: "Seth & Riley's",
    subtitle: 'Garageverse',
    summary: 'Digital world-building for an automotive culture community.',
    tags: ['Brand', 'Digital', 'Community'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'google-gemini-3',
    title: 'Google',
    subtitle: 'Gemini 3',
    summary: 'Product and campaign direction for Gemini 3 storytelling.',
    tags: ['Product', 'Brand', 'AI'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'kitkat',
    title: 'KitKat',
    subtitle: 'Break Better',
    summary: 'Campaign craft and messaging for a refreshed KitKat platform.',
    tags: ['Campaign', 'Brand', 'FMCG'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'public-investment-fund',
    title: 'Public Investment Fund',
    subtitle: 'The PIF Effect',
    summary: 'Narrative and campaign framework for a global investment story.',
    tags: ['Campaign', 'Brand', 'Government'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'disney-shell-marvel-racers',
    title: 'Disney × Shell',
    subtitle: 'Marvel racers',
    summary: 'Partnership campaign bringing Marvel characters into a retail moment.',
    tags: ['Campaign', 'Partnership', 'Entertainment'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'adobe-pergraphica',
    title: 'Adobe × Pergraphica',
    subtitle: 'Catching Feels',
    summary: 'Print-first craft with digital storytelling across a partnership launch.',
    tags: ['Print', 'Brand', 'Partnership'],
    media: defaultThumbnailBg,
    thumbnailVideo: PROJECT_VIDEOS['adobe-pergraphica'],
    heroHeadline: 'Catching Feels',
  },
  {
    slug: 'auto-finesse',
    title: 'Auto Finesse',
    subtitle: "Making 'em shine, since '99",
    summary: 'Brand and CX work for a premium car care business.',
    tags: ['Brand', 'CX', 'Car Care'],
    media: defaultThumbnailBg,
    thumbnailVideo: PROJECT_VIDEOS['auto-finesse'],
  },
  {
    slug: 'nespresso',
    title: 'Nespresso',
    subtitle: 'Coffee Crystals',
    summary: 'Brand direction and packaging-led storytelling for FMCG.',
    tags: ['Brand', 'Direction', 'FMCG'],
    media: defaultThumbnailBg,
    thumbnailVideo: PROJECT_VIDEOS.nespresso,
  },
  {
    slug: 'unmind',
    title: 'Unmind',
    subtitle: 'Building mentally healthy businesses',
    summary: 'Brand and product UX for a mental health platform.',
    tags: ['UI / UX', 'Brand', 'Mental Health'],
    media: projectThumbnailBg(PROJECT_IMAGES.unmind),
    thumbnailSrc: PROJECT_IMAGES.unmind,
  },
  {
    slug: 'bide-and-fecht',
    title: 'Bide & Fecht',
    subtitle: 'Remain steady. Move forward.',
    summary: 'Brand and e-commerce work for an independent clothing label.',
    tags: ['Brand', 'E-comm', 'Clothing'],
    media: projectThumbnailBg(PROJECT_IMAGES['bide-and-fecht']),
    thumbnailSrc: PROJECT_IMAGES['bide-and-fecht'],
  },
  {
    slug: 'click-travel',
    title: 'Click Travel',
    subtitle: "The world's smoothest business traveller",
    summary: 'Motion, photography, and campaign work for business travel.',
    tags: ['Motion', 'Photography', 'Travel'],
    media: defaultThumbnailBg,
    thumbnailVideo: PROJECT_VIDEOS['click-travel'],
  },
  {
    slug: 'interflora',
    title: 'Interflora',
    subtitle: 'Share something real',
    summary: 'D2C campaign and brand work for Interflora.',
    tags: ['Campaign', 'Brand', 'D2C'],
    media: projectThumbnailBg(PROJECT_IMAGES.interflora),
    thumbnailSrc: PROJECT_IMAGES.interflora,
  },
  {
    slug: 'photography',
    title: 'Photography',
    subtitle: 'Curated selection',
    summary: 'A curated selection of photography and direction work.',
    tags: ['Photography', 'Direction', 'Automotive'],
    media: defaultThumbnailBg,
  },
  {
    slug: 'archive',
    title: 'Archive',
    subtitle: 'Curation of single design pieces',
    summary: 'A curated archive of selected design pieces.',
    tags: ['Advertising', 'Brand', 'Campaign'],
    media: defaultThumbnailBg,
  },
]

function adjacentSummary(def: ProjectDefinition): AdjacentSummary {
  const { slug, title, subtitle, media, tags, status, thumbnailVideo } = def
  return {
    slug,
    title,
    subtitle,
    media,
    tags,
    ...(status ? { status } : {}),
    ...(thumbnailVideo ? { thumbnailVideo } : {}),
  }
}

export const projects: Project[] = projectDefinitions.map((def, i) => {
  const { heroHeadline, ...projectFields } = def
  const n = projectDefinitions.length
  const prev = projectDefinitions[(i - 1 + n) % n]
  const next = projectDefinitions[(i + 1) % n]
  const blocks = caseStudyBlocks(
    { ...projectFields, heroHeadline },
    { prev: adjacentSummary(prev), next: adjacentSummary(next) },
  )
  const ogImage = def.thumbnailSrc ?? SITE_OG_IMAGE
  return { ...projectFields, ogImage, blocks }
})

export type RecognitionEntry = {
  award: string
  project: string
}

export type RecognitionGroup = {
  organisation: string
  entries: RecognitionEntry[]
}

/** Grouped rows — matches recognition reference layout */
export const recognitionGroups: RecognitionGroup[] = [
  {
    organisation: 'Adobe Max',
    entries: [{ award: 'Ceremony Feature', project: 'Adobe x Pergraphica' }],
  },
  {
    organisation: 'Athar Awards',
    entries: [
      { award: 'National Dev. Campaign - Gold', project: "PIF - The 'PIF' Effect" },
      { award: 'Campaign for The Future of KSA', project: "PIF - The 'PIF' Effect" },
    ],
  },
  {
    organisation: 'Awwwards',
    entries: [
      { award: 'SOTD Nominee', project: 'Opal Digital' },
      { award: 'Mobile Excellence', project: 'Opal Digital' },
    ],
  },
  {
    organisation: 'Campaign',
    entries: [
      { award: 'Launch feature', project: 'Generali - Here now' },
      { award: 'Christmas Round-Up', project: 'Boots - Joy for all' },
    ],
  },
  {
    organisation: 'The Clios',
    entries: [{ award: 'Ads of the world', project: 'Generali - Here now' }],
  },
  {
    organisation: 'The Drum',
    entries: [
      { award: 'Chair Award', project: 'Adobe x Pergraphica' },
      { award: 'DADI - Gold', project: 'Adobe x Pergraphica' },
      { award: 'B2B Sector - Gold', project: 'Adobe x Pergraphica' },
      { award: 'Editors Picks', project: 'Boots - Joy for all' },
    ],
  },
  {
    organisation: 'Global ACE Awards',
    entries: [{ award: 'Integrated Marketing - Gold', project: 'Adobe x Pergraphica' }],
  },
  {
    organisation: 'Product Hunt',
    entries: [{ award: 'The Golden Kitty', project: 'Podastle - Rebrand' }],
  },
  {
    organisation: 'IPA Effectiveness',
    entries: [{ award: 'Best B2B Campaign - Gold', project: 'Adobe x Pergraphica' }],
  },
  {
    organisation: 'The B2 Awards',
    entries: [{ award: 'Best Use of Display Advertising', project: 'Click Travel' }],
  },
  {
    organisation: 'The Webby Awards',
    entries: [{ award: 'Creative Production Apps - Gold', project: 'Podastle - Rebrand' }],
  },
  {
    organisation: 'YunoJuno',
    entries: [{ award: 'Top Talent award', project: "YJ Awards '24" }],
  },
]
