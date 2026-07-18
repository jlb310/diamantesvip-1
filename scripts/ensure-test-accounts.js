/**
 * Cuentas de prueba para que Seba Vera (socio) pueda probar la plataforma él mismo.
 *
 * Idempotente: crea las cuentas solo si NO existen (verifica por email). No borra
 * ni modifica nada existente. Se ejecuta en cada arranque desde server-wrapper.js,
 * SIN el candado de NODE_ENV=production, para que funcione también en prod.
 *
 * Crea:
 *   1. Diamante (rol escort): contacto@diamantesvip.cl / demo1234
 *      Perfil casi vacío + status "pending", para probar el onboarding del tutorial
 *      (entrar → completar info → subir contenido) y luego aprobarlo desde admin.
 *   2. Admin (rol admin): seba-admin@diamantesvip.cl / (SEBA_ADMIN_PASSWORD env
 *      o fallback fuerte hardcodeado) para probar el panel de administración.
 *
 * Claves overridables por env: SEBA_DIAMANTE_PASSWORD, SEBA_ADMIN_PASSWORD.
 * Son cuentas de prueba: borrarlas o cambiarles la clave al terminar.
 *
 * Requiere: DATABASE_URL apuntando a la DB SQLite.
 */

const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function ensureUser({ email, password, role, escort, photos }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`⏭️  Cuenta de prueba ya existe: ${email} (${role})`)
    return false
  }

  const hashed = await bcryptjs.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      role,
      ...(escort
        ? {
            escort: {
              create: {
                ...escort,
                ...(photos && photos.length
                  ? { photos: { create: photos.map((url, i) => ({ url, order: i })) } }
                  : {}),
              },
            },
          }
        : {}),
    },
  })

  console.log(`✅ Cuenta de prueba creada: ${email} (${role})`)
  return true
}

async function main() {
  console.log('👥 Asegurando cuentas de prueba de Seba...')

  // Claves overridables por env (recomendado en prod). Si no están seteadas, se usa
  // un fallback para que las pruebas funcionen out-of-the-box. La de admin es fuerte
  // y aleatoria a propósito (no adivinable). Cambiarlas/borrar las cuentas al terminar.
  const diamantePassword = process.env.SEBA_DIAMANTE_PASSWORD || 'demo1234'
  const adminPassword = process.env.SEBA_ADMIN_PASSWORD || 'Dv7-Kx92-mQ4t-Zr8p'

  // 1. Cuenta de diamante para probar el onboarding (perfil casi vacío, en revisión)
  await ensureUser({
    email: 'contacto@diamantesvip.cl',
    password: diamantePassword,
    role: 'escort',
    escort: {
      name: 'Cuenta de prueba',
      age: 25,
      city: 'Santiago',
      active: true,
      status: 'pending', // simula un registro nuevo: Seba la aprueba desde admin
      verified: false,
      featured: false,
      tier: 'Silver',
    },
  })

  // 2. Segundo admin para probar el panel de administración
  await ensureUser({
    email: 'seba-admin@diamantesvip.cl',
    password: adminPassword,
    role: 'admin',
  })

  // 3. Diamante con PERFIL INVENTADO completo, aprobado y visible.
  //    Sirve para probar el login "de la niña" y aterrizar directo en su perfil
  //    público (que se ve lleno, como uno real). NO es la de onboarding (esa es
  //    la #1, en 'pending' y casi vacía).
  const demoPassword = process.env.SEBA_PERFIL_PASSWORD || 'demo1234'
  await ensureUser({
    email: 'prueba@diamantesvip.cl',
    password: demoPassword,
    role: 'escort',
    escort: {
      name: 'Antonella Fuentes',
      alias: 'Antonella VIP',
      age: 26,
      city: 'Santiago',
      description:
        'Modelo independiente de trato cercano y elegante. Disfruto de las buenas conversaciones, la música y los momentos sin apuro. Ofrezco una experiencia de acompañamiento exclusiva y con total discreción para caballeros que buscan algo diferente. (Perfil de demostración.)',
      services: JSON.stringify(['Acompañamiento', 'Cena romántica', 'Eventos', 'Masaje relajante']),
      phone: '+56912345678',
      whatsapp: '+56912345678',
      nationality: 'Chilena',
      height: 168,
      weight: 55,
      measurements: '90-60-92',
      bodyType: 'Delgada',
      hairColor: 'Castaño',
      eyeColor: 'Verdes',
      bustSize: 'Mediano',
      buttSize: 'Grande',
      waxing: 'Full',
      tattoos: true,
      piercings: false,
      languages: JSON.stringify(['Español', 'Inglés']),
      atHome: true,
      hotels: true,
      homeService: true,
      price: 120000,
      availability: JSON.stringify({ LUN: '15:00 a 00:00', MAR: '15:00 a 00:00', MIE: '15:00 a 00:00', JUE: '15:00 a 00:00', VIE: '15:00 a 02:00', SAB: '15:00 a 02:00', DOM: 'Descanso' }),
      active: true,
      status: 'approved', // visible en el sitio: el perfil se ve lleno
      verified: true,
      featured: true,
      tier: 'VIP',
      mainPhoto: '/webp/017b32ed8684426acf12b944.webp',
    },
    photos: [
      '/webp/07c62cc2070c74d546ac98cd.webp',
      '/webp/09f60af8823e2652268e30e2.webp',
      '/webp/0a2cbc34bb71ae650a770fcc.webp',
      '/webp/0b1463192aa3a320a6adf9ec.webp',
    ],
  })

  console.log('👥 Cuentas de prueba listas.')
}

main()
  .catch((e) => {
    console.error('⚠️  ensure-test-accounts falló:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
