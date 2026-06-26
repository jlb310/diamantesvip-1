function encodeUrl(url: string): string {
  const bytes = new TextEncoder().encode(url)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function webpUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (!url.startsWith('http')) return url
  return `/api/webp/${encodeUrl(url)}`
}
