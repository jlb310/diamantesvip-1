import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthPayload } from '@/lib/require-auth'

const ALLOWED_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
const MAX_SIZE = 20 * 1024 * 1024

// Videos de galería del perfil (modelo Video, los mismos que se muestran en el
// perfil público). Todo acotado a la escort dueña del token.
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

  const videos = await prisma.video.findMany({
    where: { escortId: r.escort.id },
    orderBy: { order: 'asc' },
    select: { id: true, url: true, thumbnail: true, order: true },
  })
  return NextResponse.json({ videos })
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
      return NextResponse.json({ error: 'Formato no permitido (usa MP4, WebM o MOV)' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 20MB)' }, { status: 400 })
    }

    // Igual que historias: se guarda como data-URL base64.
    const buffer = Buffer.from(await file.arrayBuffer())
    const mime = file.type || 'video/mp4'
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`

    const count = await prisma.video.count({ where: { escortId: r.escort.id } })
    const video = await prisma.video.create({
      data: { url: dataUrl, order: count, escortId: r.escort.id },
      select: { id: true, url: true, thumbnail: true, order: true },
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json({ error: 'Error al subir video' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const r = await resolveEscort(req.headers.get('authorization'))
    if ('error' in r) return r.error

    const id = new URL(req.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del video' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({ where: { id } })
    if (!video || video.escortId !== r.escort.id) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    await prisma.video.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Error al eliminar video' }, { status: 500 })
  }
}
