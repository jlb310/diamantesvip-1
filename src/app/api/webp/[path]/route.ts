import { NextResponse } from 'next/server'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { decodeWebpPath, webpLocalPath } from '@/lib/webp-server'

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
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  return NextResponse.redirect(originalUrl, { status: 307 })
}
