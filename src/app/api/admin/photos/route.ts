import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthPayload } from '@/lib/require-auth'

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024

// Resuelve la diamante dueña del token. Todas las operaciones quedan acotadas a
// SU escort (multi-tenant): nunca se tocan fotos de otra.
async function resolveEscort(authHeader: string | null) {
  const payload = getAuthPayload(authHeader)
  if (!payload) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  const escort = await prisma.escort.findFirst({
    where: { userId: payload.id },
    select: { id: true },
  })
  if (!escort) {
    return { error: NextResponse.json({ error: 'Diamante no encontrada' }, { status: 404 }) }
  }
  return { escort }
}

export async function GET(req: NextRequest) {
  const r = await resolveEscort(req.headers.get('authorization'))
  if ('error' in r) return r.error

  const photos = await prisma.photo.findMany({
    where: { escortId: r.escort.id },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ photos })
}

export async function POST(req: NextRequest) {
  try {
    const r = await resolveEscort(req.headers.get('authorization'))
    if ('error' in r) return r.error

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 })
    }
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 10MB)' }, { status: 400 })
    }

    // Guardamos como data-URL base64 (igual que historias): no depende de servir
    // archivos escritos en runtime, que en el build standalone no es confiable.
    const buffer = Buffer.from(await file.arrayBuffer())
    const mime = file.type || 'image/jpeg'
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`

    const count = await prisma.photo.count({ where: { escortId: r.escort.id } })
    const photo = await prisma.photo.create({
      data: { url: dataUrl, order: count, escortId: r.escort.id },
    })

    return NextResponse.json({ success: true, photo })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Error al subir foto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const r = await resolveEscort(req.headers.get('authorization'))
    if ('error' in r) return r.error

    const id = new URL(req.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Falta el id de la foto' }, { status: 400 })
    }

    const photo = await prisma.photo.findUnique({ where: { id } })
    if (!photo || photo.escortId !== r.escort.id) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })
    }

    await prisma.photo.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: 'Error al eliminar foto' }, { status: 500 })
  }
}
