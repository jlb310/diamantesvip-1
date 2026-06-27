import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'

export async function POST() {
  const secret = process.env.AUTH_SECRET || 'dev-only-not-for-production'
  const expires = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
  const payload = `true|${expires}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  const value = `${payload}|${sig}`

  const res = NextResponse.json({ ok: true })
  res.cookies.set('age-verified', value, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
  })
  return res
}