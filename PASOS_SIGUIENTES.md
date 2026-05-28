# Pasos Siguientes - Diamantes VIP

> Roadmap técnico y de producto basado en el estado actual del proyecto (2026-05-22).
> Priorizado por impacto de negocio, seguridad y esfuerzo de implementación.

---

## Fase 1: Fundamentos de Producción (Crítico — Semanas 1-2)

### 1.1 Seguridad y Autenticación
- [ ] **Migrar JWT a httpOnly cookies** — Reemplazar localStorage por cookies `httpOnly; Secure; SameSite=Strict` para mitigar XSS
- [ ] **Implementar rate limiting** — Agregar `lru-cache` o `rate-limiter-flexible` en middleware.ts y API routes críticas (login, register, webhook)
- [ ] **Validar inputs con Zod** — Aplicar esquemas Zod en todas las API routes (actualmente solo usan typeof checks)
- [ ] **Sanitizar outputs** — Asegurar que descripciones y textos libres no inyecten HTML/JS (react already escapa, pero verificar APIs)
- [ ] **Rotar AUTH_SECRET** — Generar secret de 32+ chars seguro, mover a Docker secrets o env var de producción
- [ ] **CSP headers** — Content Security Policy en next.config.ts o middleware

### 1.2 Base de Datos
- [ ] **Migrar a PostgreSQL** — Cambiar Prisma provider de `sqlite` a `postgresql` para concurrencia y escalabilidad
- [ ] **Connection pooling** — Configurar `pgbouncer` o Prisma Accelerate si se usa serverless
- [ ] **Backups automatizados** — Script cron para dump de PostgreSQL o usar managed DB con backups automáticos
- [ ] **Soft deletes** — Agregar `deletedAt` a modelos clave (Escort, Photo, Review) para no perder datos

### 1.3 Variables de Entorno y Configuración
- [ ] **Crear .env.example** — Documentar todas las variables requeridas
- [ ] **Separar .env por ambiente** — `.env.local`, `.env.production`, `.env.staging`
- [ ] **Configurar Flow.cl en producción** — Reemplar placeholders con API key y secret reales, activar webhook real
- [ ] **Configurar dominio y SSL** — `diamantesvip.cl` con certificado HTTPS (Let's Encrypt o Cloudflare)

---

## Fase 2: Producto MVP Completo (Alto Impacto — Semanas 3-5)

### 2.1 Activar el Home Real
- [ ] **Reemplazar landing "Pronto"** — La ruta `/` debe mostrar el home real (actualmente solo `/home` funciona) o redirigir `/` → `/home` manteniendo el age-gate
- [ ] **Age gate real** — Implementar modal de verificación de edad en `/` antes de redirigir a `/home`
- [ ] **Geolocalización por IP** — Detectar ciudad del visitante y pre-ordenar escorts cercanas

### 2.2 Sistema de Mensajes / Contacto
- [ ] **Chat interno (opcional fase 3)** — O si se prefiere simple: enmascarar WhatsApp con un redirect tracker
- [ ] **Formulario de contacto** — Crear `/contacto` funcional (actualmente es un link muerto en el nav)
- [ ] **Sistema de "Me interesa"** — Botón en perfil para enviar notificación al escort (requiere notificaciones push)

### 2.3 Favoritos y Usuarios Cliente
- [ ] **Registro de clientes** — Diferenciar `role: "client"` de `role: "escort"`
- [ ] **Guardar favoritos** — Tabla `Favorite` (clientId + escortId), mostrar en home con badge de corazón
- [ ] **Historial de visitas** — Registrar views por perfil para recomendaciones

### 2.4 SEO y Contenido
- [ ] **Página de ciudad/region** — Rutas dinámicas `/ciudad/santiago`, `/ciudad/valparaiso` con escorts filtradas y metadata específica
- [ ] **Blog/Guía** — `/blog` con artículos para atraer tráfico orgánico ("Guía de acompañantes en Santiago", etc.)
- [ ] **Páginas legales** — `/terminos`, `/privacidad`, `/cookies` (requerido por ley chilena y Flow.cl)
- [ ] **Schema.org mejorado** — Agregar `LocalBusiness`, `Person`, `AggregateRating` schemas

### 2.5 Admin Dashboard Real
- [ ] **Estadísticas** — Implementar `/admin` sección de estadísticas: visitas por perfil, contactos, CTR, ingresos
- [ ] **Moderación de reviews** — Panel para aprobar/rechazar reviews antes de publicarlas
- [ ] **Gestión de usuarios** — CRUD completo de clientes y escorts desde admin
- [ ] **Asignación manual de tiers** — Admin puede cambiar tier VIP/Gold/Silver independiente del pago

---

## Fase 3: Escalabilidad y UX Avanzada (Semanas 6-8)

### 3.1 Almacenamiento y Media
- [ ] **Migrar a Cloudflare R2 / AWS S3** — Subida directa con presigned URLs, no guardar en disco local
- [ ] **Optimización de imágenes** — WebP/AVIF automático, múltiples tamaños (thumbnail, card, full)
- [ ] **CDN para assets** — Cloudflare o CloudFront para distribución global
- [ ] **Lazy loading de videos** — Intersection Observer para no cargar videos hasta que sean visibles

### 3.2 Notificaciones
- [ ] **Push notifications** — Web Push API para nuevos mensajes, reviews, pagos recibidos
- [ ] **Email transaccionales** — Bienvenida, pago confirmado, suscripción por vencer (Resend/Postmark/SendGrid)
- [ ] **SMS/WhatsApp Business API** — Notificaciones críticas (opcional, costo elevado)

### 3.3 Monetización Avanzada
- [ ] **Múltiples planes** — Silver ($200k), Gold ($300k), VIP ($400k) como se muestra en `/anunciate`
- [ ] **Publicidad / Featured slots** — Permitir a escorts pagar por posiciones destacadas
- [ ] **Comisión por contacto** — Cobrar a escorts por cada lead/WhatsApp click (modelo freemium)
- [ ] **Gift cards / Créditos** — Sistema de créditos internos para destacados temporales

### 3.4 Búsqueda Avanzada
- [ ] **Filtros geográficos** — Por región, comuna, cercanía (usar coordenadas GPS si el escort lo permite)
- [ ] **Rango de precios** — Slider min/max en la búsqueda
- [ ] **Ordenamiento** — Por precio, edad, rating, cercanía, fecha de registro
- [ ] **Búsqueda por disponibilidad horaria** — "Quién está disponible ahora" con lógica real de horarios
- [ ] **Autocomplete/suggestions** — Sugerencias de ciudad, servicio, nombre mientras se escribe

### 3.5 Mobile App / PWA Mejorada
- [ ] **Offline support** — Service worker con cache de perfiles visitados
- [ ] **Instalación nativa** — Prompt de instalación mejorado, splash screens
- [ ] **Swipe gestures** — Tinder-like swipe para descubrir escorts (opcional viral)

---

## Fase 4: Operaciones y Crecimiento (Semanas 9-12)

### 4.1 Analytics y Métricas
- [ ] **Google Analytics 4 / Plausible** — Tracking de eventos: view profile, click WhatsApp, search, registration
- [ ] **Dashboard de negocio** — Ingresos mensuales, churn rate, CAC, LTV por escort
- [ ] **Heatmaps** — Hotjar o Clarity para entender comportamiento de usuarios
- [ ] **A/B testing** — Optimizar conversiones en `/anunciate` y perfiles

### 4.2 Seguridad y Legal
- [ ] **Verificación de identidad** — Integrar API de verificación de identidad (Veriff, Jumio) o manual con selfie + ID
- [ ] **Content moderation** — IA para detectar contenido explícito en fotos (AWS Rekognition, Sightengine)
- [ ] **Reportes de usuarios** — Botón "Reportar" en perfiles para spam, fake, contenido inapropiado
- [ ] **GDPR / Ley 19.628** — Derecho al olvido, exportación de datos, consentimientos

### 4.3 Escalado Técnico
- [ ] **Redis** — Cache de queries frecuentes (home, perfiles populares), rate limiting, sessions
- [ ] **Next.js ISR** — Incremental Static Regeneration para perfiles de escorts populares
- [ ] **Edge Functions** — Middleware en edge para geolocalización y redirects
- [ ] **Load balancing** — Si el tráfico crece, múltiples instancias Docker + reverse proxy (Traefik/Nginx)

### 4.4 Marketplace Features
- [ ] **Sistema de referidos** — Código único por escort, descuento por referir a otra
- [ ] **Escort agency accounts** — Permitir que agencias manejen múltiples perfiles bajo un solo login
- [ ] **Touring / Disponibilidad temporal** — Escorts pueden marcar fechas de disponibilidad por ciudad
- [ ] **Wishlist / Requests** — Clientes pueden solicitar escorts en ciudades donde no hay disponibilidad

---

## Fase 5: Diferenciación Premium (Futuro)

- [ ] **Video call verification** — Verificación por videollamada para sello "100% real"
- [ ] **Exclusive events** — Sistema de eventos privados, RSVP, tickets digitales
- [ ] **Concierge service** — Servicio de reserva de hoteles, restaurantes, transporte integrado
- [ ] **Escort blog / Magazine** — Contenido editorial para branding y SEO masivo
- [ ] **API pública** — Para integraciones con terceros (apps, agencias)
- [ ] **Multi-país** — Soporte para Perú, Argentina, Colombia (i18n completo, monedas, pagos locales)

---

## Dependencias Críticas para Lanzamiento

| # | Tarea | Bloquea | Prioridad |
|---|-------|---------|-----------|
| 1 | PostgreSQL + backups | Todo escalado | CRÍTICA |
| 2 | httpOnly cookies + rate limit | Seguridad básica | CRÍTICA |
| 3 | Flow.cl producción | Monetización | CRÍTICA |
| 4 | SSL + dominio | SEO y confianza | CRÍTICA |
| 5 | Páginas legales | Compliance chileno | ALTA |
| 6 | Activar home real en `/` | Tráfico orgánico | ALTA |
| 7 | S3/R2 para fotos | Escalabilidad media | ALTA |
| 8 | Analytics GA4 | Decisiones de producto | MEDIA |
| 9 | Sistema de favoritos | Engagement usuario | MEDIA |
| 10 | Email transaccionales | Retención escorts | MEDIA |

---

## Costos Estimados (Mensuales, Producción)

| Servicio | Uso estimado | Costo aprox. |
|----------|-------------|--------------|
| VPS / Cloud instance | 2 CPU, 4GB RAM | $20-50 USD |
| PostgreSQL (managed) | 10GB, ~1k conexiones | $15-30 USD |
| Cloudflare R2 (storage) | 50GB imágenes/videos | $5-10 USD |
| Cloudflare Pro (CDN + WAF) | Dominio + protección | $20 USD |
| Flow.cl fees | Transacciones | % variable |
| Email (Resend/Postmark) | ~5k emails/mes | $0-20 USD |
| Analytics (Plausible self-hosted) | — | $0 (self-hosted) |
| **Total estimado** | | **$60-130 USD/mes** |

---

## Notas de Implementación

1. **Next.js 16 tiene breaking changes** — Consultar `node_modules/next/dist/docs/` antes de agregar nuevas APIs.
2. **Tailwind v4** — Revisar compatibilidad de plugins y configuración si se agregan librerías UI externas.
3. **React 19** — Algunas librerías de terceros pueden no ser compatibles; validar antes de instalar.
4. **Prisma** — Si se migra a PostgreSQL, requerirá `prisma migrate deploy` en el Dockerfile.
5. **Regulación chilena** — El sitio opera en un nicho regulado; mantener consultoría legal activa para términos y políticas.

---

*Roadmap generado automáticamente. Recomendado revisar y ajustar prioridades según feedback de usuarios y métricas de tráfico reales.*
