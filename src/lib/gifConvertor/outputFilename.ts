export function sanitizeOutputBasename(raw: string): string {
  const stripped = raw
    .replace(/\.gif$/i, '')
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim()
  return stripped || 'output'
}

export function outputGifName(basename: string): string {
  return `${sanitizeOutputBasename(basename)}.gif`
}
