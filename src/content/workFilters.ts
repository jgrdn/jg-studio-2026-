export const WORK_COLUMNS = [2, 3, 4] as const
export type WorkColumns = (typeof WORK_COLUMNS)[number]

export const WORK_RATIOS = ['4-5', '5-4', '1-1'] as const
export type WorkRatio = (typeof WORK_RATIOS)[number]

export const WORK_TYPES = [
  'brand',
  'ui',
  'ux',
  'build',
  'advertising',
  'campaign',
  'product',
  'motion',
  'photography',
  'print',
  'digital',
  'partnership',
] as const
export type WorkType = (typeof WORK_TYPES)[number]

export const WORK_SECTORS = [
  'automotive',
  'fmcg',
  'technology',
  'finance',
  'health',
  'retail',
  'entertainment',
  'sport',
  'luxury',
  'government',
  'travel',
  'space',
  'platform',
  'insurance',
  'clothing',
  'd2c',
  'car-care',
  'mental-health',
  'creative',
] as const
export type WorkSector = (typeof WORK_SECTORS)[number]

export type ProjectFilterMeta = {
  workTypes: WorkType[]
  sectors: WorkSector[]
}

/** Per-project taxonomy for work grid filters */
export const projectFilterMeta: Record<string, ProjectFilterMeta> = {
  jaguar: { workTypes: ['brand', 'campaign'], sectors: ['automotive'] },
  podcastle: { workTypes: ['brand', 'product'], sectors: ['technology'] },
  seraphim: { workTypes: ['brand', 'campaign'], sectors: ['space'] },
  boots: { workTypes: ['brand', 'campaign'], sectors: ['retail'] },
  'coca-cola-premier-league': { workTypes: ['brand', 'campaign'], sectors: ['sport', 'fmcg'] },
  tiktok: { workTypes: ['brand', 'digital'], sectors: ['platform', 'technology'] },
  'katherine-hooker': { workTypes: ['brand'], sectors: ['luxury', 'retail'] },
  generali: { workTypes: ['brand', 'campaign'], sectors: ['insurance', 'finance'] },
  'salient-bio': { workTypes: ['build', 'ux', 'ui'], sectors: ['health'] },
  'seth-and-rileys': { workTypes: ['brand', 'digital'], sectors: ['automotive'] },
  'google-gemini-3': { workTypes: ['brand', 'product'], sectors: ['technology'] },
  kitkat: { workTypes: ['brand', 'campaign'], sectors: ['fmcg'] },
  'public-investment-fund': { workTypes: ['brand', 'campaign'], sectors: ['government'] },
  'disney-shell-marvel-racers': { workTypes: ['campaign', 'partnership'], sectors: ['entertainment'] },
  'adobe-pergraphica': { workTypes: ['brand', 'print', 'partnership'], sectors: ['technology'] },
  'auto-finesse': { workTypes: ['brand'], sectors: ['car-care', 'automotive'] },
  nespresso: { workTypes: ['brand'], sectors: ['fmcg'] },
  unmind: { workTypes: ['brand', 'ux', 'ui'], sectors: ['mental-health', 'health'] },
  'bide-and-fecht': { workTypes: ['brand'], sectors: ['clothing', 'retail'] },
  'click-travel': { workTypes: ['motion', 'photography'], sectors: ['travel'] },
  interflora: { workTypes: ['brand', 'campaign'], sectors: ['d2c', 'retail'] },
  photography: { workTypes: ['photography'], sectors: ['automotive', 'creative'] },
  archive: { workTypes: ['advertising', 'brand', 'campaign'], sectors: ['creative'] },
}

export function workTypeLabel(type: WorkType): string {
  const labels: Record<WorkType, string> = {
    brand: 'Brand',
    ui: 'UI',
    ux: 'UX',
    build: 'Build',
    advertising: 'Advertising',
    campaign: 'Campaign',
    product: 'Product',
    motion: 'Motion',
    photography: 'Photography',
    print: 'Print',
    digital: 'Digital',
    partnership: 'Partnership',
  }
  return labels[type]
}

export function sectorLabel(sector: WorkSector): string {
  return sector
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function ratioLabel(ratio: WorkRatio): string {
  if (ratio === '4-5') return '4:5'
  if (ratio === '5-4') return '5:4'
  return '1:1'
}

export function columnsLabel(cols: WorkColumns): string {
  return `${cols} across`
}

export function projectMatchesFilters(
  slug: string,
  activeWorkTypes: readonly WorkType[],
): boolean {
  const meta = projectFilterMeta[slug]
  if (!meta) return true
  return (
    activeWorkTypes.length === 0 ||
    activeWorkTypes.some((t) => meta.workTypes.includes(t))
  )
}

export function gridSpanClass(cols: WorkColumns): string {
  if (cols === 2) return 'span-6'
  if (cols === 4) return 'span-3'
  return 'span-4'
}
