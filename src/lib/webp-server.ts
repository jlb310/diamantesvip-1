import { createHash } from 'node:crypto'

export function urlToHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 24)
}

export function webpLocalPath(url: string): string {
  return `/webp/${urlToHash(url)}.webp`
}

export function decodeWebpPath(encoded: string): string {
  const restored = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(restored)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}
