import { NextResponse } from 'next/server'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { decodeWebpPath, webpLocalPath } from '@/lib/webp-server'

const WEBP_DIR = join(process.cwd(), 'public', 'webp')
const MAX_WIDTH = 1200
const QUALITY = 80

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

  if (!originalUrl.startsWith('http')) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const localPath = webpLocalPath(originalUrl)
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
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
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
