import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/require-auth'

export async function POST(req: NextRequest) {
  try {
    const result = requireAuth(req.headers.get('authorization'))
    if ('error' in result) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const payload = result.payload

    const escort = await prisma.escort.findFirst({
      where: { userId: payload.id },
      select: { id: true },
    })
    if (!escort) {
      return NextResponse.json({ error: 'Diamante no encontrada' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 20MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mime = file.type || 'video/mp4'
    const dataUrl = `data:${mime};base64,${base64}`

    const video = await prisma.video.create({
      data: {
        url: dataUrl,
        escortId: escort.id,
        order: 0,
      },
    })

    return NextResponse.json({ success: true, video })
  } catch (error) {
    console.error('Historias upload error:', error)
    return NextResponse.json({ error: 'Error al subir' }, { status: 500 })
  }
}