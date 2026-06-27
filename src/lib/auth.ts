import { sign, verify } from 'jsonwebtoken'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.AUTH_SECRET

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET environment variable is required in production')
}

const SECRET = JWT_SECRET || 'dev-only-not-for-production'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}

export function createToken(payload: object): string {
  return sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return verify(token, SECRET)
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { escort: true }
  })

  if (!user) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.escort?.name
  }
}

export function auth() {
  return null
}