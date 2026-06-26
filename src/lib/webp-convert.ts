import { prisma } from '@/lib/prisma'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { writeFile, rm } from 'node:fs/promises'
import { urlToHash } from '@/lib/webp-server'

const WEBP_DIR = join(process.cwd(), 'public', 'webp')
const QUALITY = 80
const MAX_WIDTH = 1200
const CONCURRENCY = 4

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function convertOne(url: string): Promise<boolean> {
  const hash = urlToHash(url)
  const dest = join(WEBP_DIR, `${hash}.webp`)

  if (existsSync(dest)) return false

  const sharp = (await import('sharp')).default
  const tmpPath = join(WEBP_DIR, `${hash}.tmp`)

  try {
    const buf = await download(url)
    await sharp(buf)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(tmpPath)
    await writeFile(dest, await readFile(tmpPath))
    return true
  } catch (e) {
    console.error(`[webp] failed ${url}:`, e)
    return false
  } finally {
    await rm(tmpPath, { force: true })
  }
}

import { readFile } from 'node:fs/promises'

async function processBatch(urls: string[], label: string) {
  let converted = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map(async (u) => {
        const hash = urlToHash(u)
        const dest = join(WEBP_DIR, `${hash}.webp`)
        const alreadyExists = existsSync(dest)
        const ok = await convertOne(u)
        return { ok, alreadyExists }
      }),
    )
    for (const r of results) {
      if (r.ok) converted++
      else if (r.alreadyExists) skipped++
      else failed++
    }
  }

  console.log(`[webp] ${label}: ${converted} converted, ${skipped} already exist, ${failed} failed`)
  return { converted, skipped, failed }
}

export async function runWebpConversion() {
  const start = Date.now()
  console.log('[webp] starting conversion', new Date().toISOString())

  if (!existsSync(WEBP_DIR)) mkdirSync(WEBP_DIR, { recursive: true })

  const [photos, videos, escorts] = await Promise.all([
    prisma.photo.findMany({ select: { url: true } }),
    prisma.video.findMany({ select: { url: true, thumbnail: true } }),
    prisma.escort.findMany({ select: { mainPhoto: true } }),
  ])

  const urls = new Set<string>()
  for (const p of photos) if (p.url?.startsWith('http')) urls.add(p.url)
  for (const v of videos) {
    if (v.thumbnail?.startsWith('http')) urls.add(v.thumbnail)
  }
  for (const e of escorts) if (e.mainPhoto?.startsWith('http')) urls.add(e.mainPhoto)

  const list = [...urls]
  console.log(`[webp] ${list.length} unique URLs to process`)

  await processBatch(list, 'all')
  await prisma.$disconnect()

  console.log(`[webp] done in ${((Date.now() - start) / 1000).toFixed(1)}s`)
}
