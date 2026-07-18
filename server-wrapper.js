const { execFileSync } = require('child_process')
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const path = require('path')
const crypto = require('crypto')

// Asegura AUTH_SECRET en runtime. src/lib/auth.ts LANZA si falta en production,
// lo que tumba toda ruta que lo importe (/api/auth/login, /register, etc.) con
// HTTP 500. Si el entorno de la VPS no lo trae, generamos/leemos uno persistente
// en el volumen de datos: estable entre reinicios y deploys, y fuera del repo.
if (!process.env.AUTH_SECRET) {
  try {
    const dataDir = path.join(__dirname, 'prisma/data')
    const secretFile = path.join(dataDir, '.auth-secret')
    let secret = existsSync(secretFile) ? readFileSync(secretFile, 'utf8').trim() : ''
    if (!secret) {
      mkdirSync(dataDir, { recursive: true })
      secret = crypto.randomBytes(32).toString('hex')
      writeFileSync(secretFile, secret, { mode: 0o600 })
      console.log('[startup] AUTH_SECRET ausente en el env: generado y persistido en prisma/data/.auth-secret')
    } else {
      console.log('[startup] AUTH_SECRET ausente en el env: usando el persistido en prisma/data/.auth-secret')
    }
    process.env.AUTH_SECRET = secret
  } catch (e) {
    console.error('[startup] no se pudo asegurar AUTH_SECRET:', e.message)
  }
}

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/data/dev.db'
const dbPath = dbUrl.replace(/^file:/, '')
const absDb = path.isAbsolute(dbPath) ? dbPath : path.join(__dirname, dbPath)
const absUrl = 'file:' + absDb

const prismaIndex = path.join(__dirname, 'node_modules/prisma/build/index.js')
if (existsSync(prismaIndex)) {
  try {
    console.log('[startup] Applying schema to', absDb)
    execFileSync('node', [prismaIndex, 'db', 'push', '--skip-generate'], {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: absUrl },
    })
  } catch (e) {
    console.error('[startup] db push failed:', e.message)
  }

  const seedPath = path.join(__dirname, 'scripts/seed-safe.js')
  if (existsSync(seedPath)) {
    try {
      console.log('[startup] Running seed...')
      execFileSync('node', [seedPath], {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: absUrl },
      })
    } catch (e) {
      console.error('[startup] seed failed:', e.message)
    }
  }

  // Cuentas de prueba de Seba (idempotente, corre siempre — también en prod)
  const testAccountsPath = path.join(__dirname, 'scripts/ensure-test-accounts.js')
  if (existsSync(testAccountsPath)) {
    try {
      console.log('[startup] Ensuring test accounts...')
      execFileSync('node', [testAccountsPath], {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: absUrl },
      })
    } catch (e) {
      console.error('[startup] ensure-test-accounts failed:', e.message)
    }
  }
}

require('./server-next.js')
