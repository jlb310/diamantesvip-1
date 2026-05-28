# Estado Actual - Diamantes VIP

> Documento generado el 2026-05-22 basado en el análisis del codebase y la memoria del proyecto.

---

## 1. Visión General del Proyecto

**Diamantes VIP** es un directorio web de acompañantes/escorts en Chile, construido como una aplicación web progresiva (PWA) con diseño de lujo editorial. El proyecto está desarrollado con **Next.js 16.2.4** (App Router), **React 19**, **Prisma ORM** sobre **SQLite**, y estilizado con **Tailwind CSS v4**.

**Repositorio:** `/Users/jaime/Documents/jlb/diamantes`  
**Dominio objetivo:** `https://diamantesvip.cl`  
**Versión actual:** `0.1.0`

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión | Uso |
|------|-----------|---------|-----|
| Framework | Next.js | 16.2.4 | SSR/SSG, App Router, API Routes |
| UI Library | React | 19.2.4 | Componentes funcionales, Hooks |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| Estilos | Tailwind CSS | 4.x | Utility-first CSS |
| ORM | Prisma | 5.22.0 | Modelo de datos, queries |
| Database | SQLite | - | Persistencia local/dev |
| Auth | jsonwebtoken + bcryptjs | 9.x / 3.x | JWT manual, hashing de passwords |
| Pagos | Flow.cl API | - | Gateway de pagos chileno (HMAC-SHA256) |
| Validación | Zod | 4.3.6 | Esquemas de validación |
| Deploy | Docker + Docker Compose | - | Contenedorización |

---

## 3. Estructura del Proyecto

```
diamantes/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── page.tsx            # Landing "Pronto..." (video background)
│   │   ├── layout.tsx          # Root layout, metadata SEO, PWA config
│   │   ├── home/               # Página principal con listado de escorts
│   │   ├── escort/[id]/        # Perfil público de escort
│   │   ├── anunciate/          # Landing de captación + registro
│   │   ├── age-verification/   # (ruta pública en middleware)
│   │   ├── admin/              # Panel de administración
│   │   │   ├── page.tsx        # Dashboard admin/escort
│   │   │   ├── login/          # Login manual
│   │   │   ├── profile/        # Editor de perfil completo
│   │   │   ├── escorts/        # Gestión de escorts (solo admin)
│   │   │   └── membresia/      # Gestión de suscripción
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # Login, registro
│   │   │   ├── admin/          # CRUD escorts, fotos, historias
│   │   │   └── payments/       # Webhook y suscripción Flow.cl
│   │   ├── globals.css         # Variables CSS, utilities glassmorphism
│   │   ├── sitemap.ts          # Sitemap dinámico
│   │   └── robots.ts           # Robots.txt dinámico
│   ├── components/             # Componentes React
│   │   ├── SiteChrome.tsx      # Wrapper layout (Header, Footer, TopBar)
│   │   ├── Header.tsx          # Navegación sticky, mobile drawer
│   │   ├── Footer.tsx          # Footer del sitio
│   │   ├── TopBar.tsx          # Barra superior utility
│   │   ├── SearchBar.tsx       # Búsqueda + filtros toggle
│   │   ├── EscortCard.tsx      # Tarjeta de escort en grid
│   │   ├── EscortProfile.tsx   # Perfil detallado (cliente)
│   │   ├── StoriesRow.tsx      # Carrusel historias/videos
│   │   ├── ShortsRow.tsx       # Carrusel shorts/reels
│   │   ├── StoryViewer.tsx     # Visualizador de stories fullscreen
│   │   └── InstallPrompt.tsx   # Prompt instalación PWA
│   ├── lib/
│   │   ├── prisma.ts           # Singleton PrismaClient
│   │   ├── auth.ts             # JWT, bcrypt, autenticación
│   │   └── flow.ts             # Integración Flow.cl (sign, pagos, suscripciones)
│   ├── middleware.ts           # Age verification, protección de rutas
│   └── types/
│       └── next-auth.d.ts      # Tipos extendidos
├── prisma/
│   └── schema.prisma           # Esquema DB (SQLite)
├── scripts/
│   ├── seed.ts                 # Seed completo (20 escorts demo + admin)
│   ├── seed-safe.ts            # Seed sin borrar datos
│   ├── deploy.sh               # Deploy Docker con backup
│   └── optimize-media.ts       # Optimización de imágenes
├── public/
│   ├── videos/                 # Videos locales (age, hero)
│   ├── uploads/                # Fotos subidas por usuarios
│   ├── presentacion/           # Landing estática de presentación
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # Iconos PWA
├── docker-compose.yml          # Docker setup (app + volumen SQLite)
├── Dockerfile                  # Build standalone Next.js
├── next.config.ts              # Standalone output, imágenes, experimental
├── DESIGN.md                   # Design system "Luminous Elegance"
└── .env                        # Variables de entorno (SQLite, Flow, Auth)
```

---

## 4. Modelo de Datos (Prisma)

### Entidades principales:

1. **User** — Usuarios del sistema (`admin` | `escort`)
2. **Escort** — Perfiles públicos (campos tipo "ElSilencio": nacionalidad, medidas, servicios, horarios, tier, etc.)
3. **Photo** — Fotos de perfil (múltiples por escort)
4. **Video** — Videos / historias (múltiples por escort, con thumbnail)
5. **Review** — Opiniones/rating de clientes (1-5 estrellas)
6. **MembershipPlan** — Planes de suscripción (Básico, VIP)
7. **Subscription** — Suscripciones activas de escorts
8. **Payment** — Pagos individuales vinculados a Flow.cl

### Relaciones:
- User 1:1 Escort (cada escort tiene un usuario)
- Escort 1:N Photo, Video, Review, Subscription
- MembershipPlan 1:N Subscription
- Subscription 1:N Payment

---

## 5. Características Implementadas

### 5.1 Frontend Público

- [x] **Landing page "Pronto"** — Video de fondo con overlay elegante (ruta `/`)
- [x] **Home de búsqueda** (`/home`) — Grid de escorts con búsqueda textual y filtros
- [x] **Perfil público** (`/escort/[id]`) — Vista detallada con galería, videos, atributos, contacto, reviews
- [x] **Sistema de búsqueda avanzada** — Por nombre, alias, ciudad, nacionalidad, servicios + toggles:
  - Con video
  - Cara visible (tiene foto principal)
  - Con experiencias (reviews)
  - Disponible ahora (tiene horarios)
  - En promoción (featured)
- [x] **Filtros por tier** — VIP / Gold / Silver con estilos visuales diferenciados
- [x] **Stories / Historias** — Carrusel tipo Instagram con visualización fullscreen
- [x] **Shorts / Reels** — Carrusel horizontal de videos destacados
- [x] **Lightbox de fotos/videos** — Navegación prev/next, indicador de tipo
- [x] **SEO completo** — Meta tags, OpenGraph, Twitter Cards, Schema.org (WebSite, Profile), sitemap.xml, robots.txt
- [x] **PWA** — Manifest, service worker, apple-mobile-web-app, theme-color
- [x] **Age verification** — Middleware que redirige a `/` si no tiene cookie `age-verified`

### 5.2 Panel de Administración (Escort)

- [x] **Dashboard personal** (`/admin`) — Accesos rápidos a perfil, fotos, historias, membresía, vista previa
- [x] **Editor de perfil completo** (`/admin/profile`) — Formulario con:
  - Datos básicos (nombre, alias, edad, ciudad)
  - Apariencia física (altura, peso, medidas, contextura, cabello, ojos, busto, cola, depilación, tatuajes, piercings)
  - Servicios (checkboxes: Acompañamiento, Masaje, Cenas, etc.)
  - Idiomas (Español, Inglés, Portugués, Francés, Italiano)
  - Lugar de atención (depto propio, hoteles, domicilio)
  - Precio por hora en CLP
  - Contacto (teléfono, WhatsApp)
  - Descripción libre
- [x] **Subida de fotos** (`/api/admin/photos`) — Almacenamiento local en `public/uploads/`
- [x] **Subida de historias/videos** (`/api/admin/historias`) — Videos con thumbnail
- [x] **Vista previa del perfil** — Link al perfil público

### 5.3 Panel de Administración (Sistema)

- [x] **Gestión de escorts** (`/admin/escorts`) — Lista completa, toggle de:
  - Destacado (featured)
  - Verificado (verified)
  - Activo/Inactivo (active)
- [x] **Login/Registro** — JWT manual con bcrypt, tokens en localStorage
- [x] **Dev-login** (`/dev-login`) — Login rápido para desarrollo sin contraseña

### 5.4 Sistema de Pagos (Flow.cl)

- [x] **Integración Flow.cl** — Creación de pagos, suscripciones, consulta de estado, cancelación
- [x] **Firmado HMAC-SHA256** — Verificación de webhooks
- [x] **Webhook endpoint** (`/api/payments/webhook`) — Confirmación de pagos y suscripciones
- [x] **Modelo de planes** — Básico (gratis) y VIP ($49.990/mes en seed)
- [x] **Activación automática** — Al pagar, se marca el perfil como `featured=true`

### 5.5 Diseño y UX

- [x] **Design System "Luminous Elegance"** — Paleta de lujo (ebony, petal pink, muted rose)
- [x] **Tipografía editorial** — Cormorant Garamond (serif) + Public Sans (sans)
- [x] **Glassmorphism** — Utilities CSS: `glass`, `glass-card`, `glass-float`, `glass-luxe`, `glass-strong`, `glass-dark`
- [x] **Responsive** — Mobile-first, grid adaptable, menú hamburger con drawer
- [x] **Micro-interacciones** — Hover scales, glow pulses, animated entrances, scroll hide header
- [x] **Dark overlay gradients** — Para legibilidad sobre fotos

### 5.6 DevOps y Scripts

- [x] **Docker + Docker Compose** — Build standalone, volumen persistente para SQLite y uploads
- [x] **Script de deploy** (`deploy.sh`) — Backup automático de DB antes de deploy
- [x] **Seed de desarrollo** (`seed.ts`) — 20 escorts demo con fotos reales (URLs externas), videos, reviews, admin user
- [x] **Optimización de media** (`optimize-media.ts`)

---

## 6. Configuración Actual

### Variables de entorno (.env):
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="super-secret-key-change-in-production-min-32-chars"
NEXTAUTH_URL="http://localhost:3003"
FLOW_API_KEY=your_flow_api_key
FLOW_SECRET_KEY=your_flow_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

### Notas de configuración:
- La DB es SQLite local (archivo `dev.db`)
- Las credenciales de Flow.cl son placeholders (no configuradas en producción)
- El puerto por defecto es 3003 (no 3000)
- `AUTH_SECRET` necesita rotarse para producción

---

## 7. Estado de Deploy

- [x] Configuración Docker lista
- [x] Next.js standalone output configurado
- [x] Imágenes remotas permitidas (`hostname: "**"`)
- [x] Consola limpiada en producción
- [ ] Variables Flow.cl requieren configuración real
- [ ] Dominio y SSL no configurados en el repo

---

## 8. Datos de Prueba (Seed)

El seed crea automáticamente:
- **1 usuario admin**: `admin@diamantes.vip` / `admin123`
- **20 escorts demo** con perfiles completos (alias, descripciones, servicios, horarios)
- **Fotos reales** (URLs de CDN externo — ~120 imágenes únicas)
- **Videos demo** (URLs de Pexels)
- **Reviews** con ratings y comentarios
- **2 planes de membresía**: Básico (gratis) y VIP ($49.990/mes)

Ciudades cubiertas: Santiago, Valparaíso, Viña del Mar, Concepción, Antofagasta, La Serena.

---

## 9. Métricas de Código (Aproximadas)

| Métrica | Valor |
|---------|-------|
| Archivos TypeScript/React | ~35 |
| Componentes UI | ~12 |
| API Routes | ~9 |
| Modelos Prisma | 8 |
| Scripts utilitarios | ~8 |
| Líneas de seed | ~1017 |
| Fotos seed | 127 URLs |

---

## 10. Observaciones y Débito Técnico Conocido

1. **Autenticación básica** — JWT en localStorage (vulnerable a XSS). Idealmente migrar a httpOnly cookies.
2. **Base de datos SQLite** — No escala. Para producción con tráfico real se necesita PostgreSQL/MySQL.
3. **Almacenamiento local de fotos** — `public/uploads/` en disco del contenedor. Requiere CDN (Cloudflare R2, AWS S3) para producción.
4. **Sin rate limiting** — Las API routes no tienen protección contra brute force o spam.
5. **Sin tests** — No hay suite de tests unitarios ni E2E.
6. **Sin CI/CD** — Deploy es manual vía script bash.
7. **Age verification superficial** — Solo una cookie, sin captcha ni verificación real de edad.
8. **Sin sistema de moderación** — No hay reportes de perfiles, ni moderación de reviews.
9. **Flow.cl en modo sandbox** — Las credenciales son placeholders; no se ha validado en producción.
10. **Admin/escort comparten rutas** — La separación de roles en `/admin` es por frontend, no por layout protegido server-side.

---

*Documento generado automáticamente a partir del análisis del repositorio.*
