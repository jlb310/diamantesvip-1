import { NextResponse } from 'next/server'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { decodeWebpPath, webpLocalPath } from '@/lib/webp-server'

const WEBP_DIR = join(process.cwd(), 'public', 'webp')
const MAX_WIDTH = 1200
const QUALITY = 80
// Anchos permitidos vía ?w= (debe calzar con WebpWidth de src/lib/webp.ts)
const ALLOWED_WIDTHS = [96, 240, 480, 1200]

const ALLOWED_HOSTS = [
  'cdn.shopify.com',
  'videos.pexels.com',
  'images.pexels.com',
]

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    return ALLOWED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h))
  } catch {
    return false
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path: encoded } = await params
  let originalUrl: string

  try {
    originalUrl = decodeWebpPath(encoded)
  } catch {
    return new NextResponse('Bad request', { status: 400 })
  }

  if (!isAllowedUrl(originalUrl)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const wParam = Number(new URL(request.url).searchParams.get('w')) || MAX_WIDTH
  const width = ALLOWED_WIDTHS.includes(wParam) ? wParam : MAX_WIDTH

  const localPath = webpLocalPath(originalUrl, width)
  const absPath = join(process.cwd(), 'public', localPath)

  if (existsSync(absPath)) {
    const data = await readFile(absPath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  if (!existsSync(WEBP_DIR)) mkdirSync(WEBP_DIR, { recursive: true })

  try {
    const res = await fetch(originalUrl, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())

    try {
      const sharp = (await import('sharp')).default
      const webpBuf = await sharp(buf)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer()

      writeFile(absPath, webpBuf).catch(() => {})

      return new NextResponse(new Uint8Array(webpBuf), {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          'Content-Type': res.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 })
  }
}