import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'
import { authenticateUser, createToken } from '@/lib/auth'

// Firma la cookie age-verified igual que /api/age-verify, para que el proxy la
// acepte. Un usuario autenticado (diamante/admin) ya es adulto: al iniciar
// sesión lo dejamos pasar el muro de edad y así el redirect al perfil no cae
// en el splash "Pronto" (/).
function ageVerifiedCookieValue(): string {
  const secret = process.env.AUTH_SECRET || 'dev-only-not-for-production'
  const expires = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
  const payload = `true|${expires}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}|${sig}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = createToken({ id: user.id, email: user.email, role: user.role })

    const res = NextResponse.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    })

    // Deja pasar el muro de edad al autenticarse (evita el splash "Pronto")
    res.cookies.set('age-verified', ageVerifiedCookieValue(), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    })

    return res
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}