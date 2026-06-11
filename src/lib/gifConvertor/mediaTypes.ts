export function isGifMediaFile(file: File): boolean {
  if (file.type === 'image/gif') return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'gif'
}

export function isAcceptedMediaFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true
  return isGifMediaFile(file)
}
