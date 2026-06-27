import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || 'escort'

  const user = await prisma.user.findFirst({
    where: { role },
    include: { escort: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  if (!user) {
    return NextResponse.json({ error: `No user found with role: ${role}` }, { status: 404 })
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role })

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.escort?.name || user.email,
    },
  })
}