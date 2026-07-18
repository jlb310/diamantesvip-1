// Migración one-shot de la SQLite antigua (prisma/data/dev.db) al Postgres nuevo.
// La corre server-wrapper.js en el arranque, y solo hace algo si:
//   - DATABASE_URL apunta a postgres
//   - existe el archivo SQLite con datos
//   - Postgres está vacío (0 usuarios) y no existe el archivo marker
// Es segura de correr en cada arranque: nunca borra ni sobreescribe nada.
// Requiere node:sqlite (node >= 22.5; en node 22 el wrapper la invoca con
// --experimental-sqlite).
const { PrismaClient } = require('@prisma/client')
const { existsSync, writeFileSync } = require('fs')
const path = require('path')

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '../prisma/data/dev.db')
const MARKER = SQLITE_PATH + '.migrated-to-postgres'

const toDate = (v) => (v == null ? null : new Date(Number(v)))
const toBool = (v) => !!v

// Campos por tabla, con conversión de fechas (SQLite guarda ms epoch) y booleanos (0/1).
// El orden respeta las FKs.
const TABLES = [
  ['User', 'user', (r) => ({
    id: r.id, email: r.email, password: r.password, role: r.role,
    createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt),
  })],
  ['MembershipPlan', 'membershipPlan', (r) => ({
    id: r.id, name: r.name, flowPlanId: r.flowPlanId, price: r.price, interval: r.interval,
    features: r.features, active: toBool(r.active),
    createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt),
  })],
  ['Escort', 'escort', (r) => ({
    id: r.id, name: r.name, alias: r.alias, age: r.age, city: r.city,
    description: r.description, services: r.services, phone: r.phone, whatsapp: r.whatsapp,
    featured: toBool(r.featured), active: toBool(r.active), status: r.status,
    mainPhoto: r.mainPhoto, createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt),
    nationality: r.nationality, height: r.height, weight: r.weight,
    measurements: r.measurements, bodyType: r.bodyType, hairColor: r.hairColor,
    eyeColor: r.eyeColor, bustSize: r.bustSize, buttSize: r.buttSize, waxing: r.waxing,
    tattoos: toBool(r.tattoos), piercings: toBool(r.piercings), languages: r.languages,
    atHome: toBool(r.atHome), hotels: toBool(r.hotels), homeService: toBool(r.homeService),
    price: r.price, availability: r.availability, verified: toBool(r.verified),
    tier: r.tier, userId: r.userId,
  })],
  ['Photo', 'photo', (r) => ({
    id: r.id, url: r.url, order: r.order, createdAt: toDate(r.createdAt), escortId: r.escortId,
  })],
  ['Video', 'video', (r) => ({
    id: r.id, url: r.url, thumbnail: r.thumbnail, order: r.order,
    createdAt: toDate(r.createdAt), escortId: r.escortId,
  })],
  ['Review', 'review', (r) => ({
    id: r.id, author: r.author, rating: r.rating, comment: r.comment,
    createdAt: toDate(r.createdAt), escortId: r.escortId,
  })],
  ['Subscription', 'subscription', (r) => ({
    id: r.id, status: r.status, flowSubId: r.flowSubId,
    currentPeriodStart: toDate(r.currentPeriodStart), currentPeriodEnd: toDate(r.currentPeriodEnd),
    cancelledAt: toDate(r.cancelledAt), createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt),
    escortId: r.escortId, planId: r.planId,
  })],
  ['Payment', 'payment', (r) => ({
    id: r.id, flowOrderId: r.flowOrderId, amount: r.amount, status: r.status,
    paidAt: toDate(r.paidAt), createdAt: toDate(r.createdAt), subscriptionId: r.subscriptionId,
  })],
  ['ProfileVisit', 'profileVisit', (r) => ({
    id: r.id, escortId: r.escortId, ipHash: r.ipHash, referer: r.referer,
    createdAt: toDate(r.createdAt),
  })],
  ['SiteSetting', 'siteSetting', (r) => ({
    key: r.key, value: r.value, updatedAt: toDate(r.updatedAt),
  })],
]

async function main() {
  const dbUrl = process.env.DATABASE_URL || ''
  if (!/^postgres/.test(dbUrl)) {
    console.log('[migrate] DATABASE_URL no es postgres; nada que migrar')
    return
  }
  if (existsSync(MARKER)) {
    console.log('[migrate] ya migrado antes (marker presente); saltando')
    return
  }
  if (!existsSync(SQLITE_PATH)) {
    console.log('[migrate] no existe SQLite en', SQLITE_PATH, '- nada que migrar')
    return
  }

  let DatabaseSync
  try {
    ;({ DatabaseSync } = require('node:sqlite'))
  } catch (e) {
    console.error('[migrate] ERROR: node:sqlite no disponible:', e.message)
    process.exit(2)
  }

  const prisma = new PrismaClient()
  try {
    const usersInPg = await prisma.user.count()
    if (usersInPg > 0) {
      console.log(`[migrate] Postgres ya tiene ${usersInPg} usuarios; no se migra (marker escrito)`)
      writeFileSync(MARKER, `skipped: pg ya tenía datos ${new Date().toISOString()}\n`)
      return
    }

    const db = new DatabaseSync(SQLITE_PATH)
    let total = 0
    for (const [table, model, map] of TABLES) {
      let rows = []
      try {
        rows = db.prepare(`SELECT * FROM "${table}"`).all()
      } catch (e) {
        console.log(`[migrate] tabla ${table} no legible (${e.message}); saltando`)
        continue
      }
      if (rows.length === 0) {
        console.log(`[migrate] ${table}: 0 filas`)
        continue
      }
      const data = rows.map(map)
      const res = await prisma[model].createMany({ data, skipDuplicates: true })
      total += res.count
      console.log(`[migrate] ${table}: ${res.count}/${rows.length} filas migradas`)
    }
    db.close()

    writeFileSync(MARKER, `migrated ${total} rows ${new Date().toISOString()}\n`)
    console.log(`[migrate] LISTO: ${total} filas migradas de SQLite a Postgres`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('[migrate] ERROR:', e)
  process.exit(1)
})
