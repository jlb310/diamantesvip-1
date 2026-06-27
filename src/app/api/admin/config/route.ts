import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Claves de configuración soportadas y sus valores por defecto.
const DEFAULTS: Record<string, string> = {
  contactWhatsapp: '56932508878',
  contactEmail: 'contacto@diamantesvip.cl',
}

function requireAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const payload = verifyToken(auth.replace('Bearer ', ''))
  if (!payload || payload.role !== 'admin') return null
  return payload
}

export async function GET(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const rows = await prisma.siteSetting.findMany()
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    const config = { ...DEFAULTS, ...stored }

    return NextResponse.json({ config })
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()

    const updates = Object.keys(DEFAULTS)
      .filter((key) => typeof body[key] === 'string')
      .map((key) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: String(body[key]).trim() },
          update: { value: String(body[key]).trim() },
        })
      )

    await Promise.all(updates)

    const rows = await prisma.siteSetting.findMany()
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    const config = { ...DEFAULTS, ...stored }

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
