const { execFileSync } = require('child_process')
const { existsSync } = require('fs')
const path = require('path')

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
