function encodeUrl(url: string): string {
  const bytes = new TextEncoder().encode(url)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Anchos permitidos por /api/webp (debe calzar con ALLOWED_WIDTHS del route).
export type WebpWidth = 96 | 240 | 480 | 1200

export function webpUrl(url: string | null | undefined, width?: WebpWidth): string {
  if (!url) return ''
  if (!url.startsWith('http')) return url
  const base = `/api/webp/${encodeUrl(url)}`
  return width && width !== 1200 ? `${base}?w=${width}` : base
}
