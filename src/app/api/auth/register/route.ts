import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, alias, age, city } = body

    if (!email || !password || !name || !age || !city) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'escort',
        escort: {
          create: {
            name,
            alias: alias || null,
            age: parseInt(age),
            city,
            status: 'pending', // requiere aprobación del administrador antes de publicarse
          },
        },
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 })
  }
}