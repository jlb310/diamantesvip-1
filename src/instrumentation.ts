export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { execSync } = await import('child_process')
    const { existsSync } = await import('fs')
    const { join } = await import('path')

    const dockerPrisma = '/app/node_modules/prisma/build/index.js'
    const localPrisma = join(process.cwd(), 'node_modules/prisma/build/index.js')
    const prismaBin = existsSync(dockerPrisma)
      ? dockerPrisma
      : existsSync(localPrisma)
        ? localPrisma
        : null

    if (prismaBin) {
      try {
        console.log('[startup] Applying database schema...')
        execSync(`node "${prismaBin}" db push --skip-generate`, {
          stdio: 'inherit',
          env: { ...process.env },
        })
        console.log('[startup] Schema applied.')
      } catch (e) {
        console.error('[startup] db push failed:', e)
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[startup] prisma binary not found, skipping db push')
    }

    try {
      const seedPath = '/app/scripts/seed-safe.js'
      if (existsSync(seedPath)) {
        console.log('[startup] Running seed...')
        execSync(`node ${seedPath}`, {
          stdio: 'inherit',
          env: { ...process.env },
        })
        console.log('[startup] Seed done.')
      }
    } catch (e) {
      console.error('[startup] Seed failed:', e)
    }

    if (process.env.NODE_ENV === 'production') {
      try {
        const cron = (await import('node-cron')).default
        const { runWebpConversion } = await import('@/lib/webp-convert')
        cron.schedule('0 4 * * *', () => {
          runWebpConversion().catch((e) => console.error('[cron] webp failed:', e))
        })
        console.log('[startup] Scheduled webp conversion cron at 04:00')

        runWebpConversion().catch((e) => console.error('[startup] webp pre-warm failed:', e))
        console.log('[startup] Webp pre-warm started (background)')
      } catch (e) {
        console.error('[startup] cron schedule failed:', e)
      }
    }
  }
}
