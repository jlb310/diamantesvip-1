'use client'

import Link from 'next/link'
import { useState } from 'react'

/**
 * Captura con fallback: si el archivo aún no existe en /public/tutorial/,
 * muestra un placeholder elegante en lugar de romper la página.
 * Para activar una captura real, sube la imagen a: public/tutorial/<archivo>
 */
function Shot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [ok, setOk] = useState(true)
  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-[#f9dade] bg-white">
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setOk(false)}
          className="w-full h-auto block"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center bg-[#fdf3f5]">
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium text-[#db7581]">Captura pendiente</span>
          <code className="text-[11px] text-muted-light">public/tutorial/{src.split('/').pop()}</code>
        </div>
      )}
      {caption && (
        <figcaption className="px-4 py-2 text-xs text-muted-light bg-[#fdf3f5] border-t border-[#f9dade]">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-float rounded-sm p-6 md:p-7">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-accent text-white font-bold flex items-center justify-center font-serif">
          {n}
        </span>
        <h2 className="text-xl font-display text-brand">{title}</h2>
      </div>
      <div className="text-muted text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

export default function TutorialPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-display text-brand mb-2">
          Cómo subir tu material
        </h1>
        <p className="text-muted-light text-sm">
          Guía paso a paso para completar tu perfil y subir tus fotos, videos e historias.
          Síguela en orden y en pocos minutos tu perfil estará listo. 💎
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/admin/login" className="bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:shadow-lg hover:shadow-accent/20">
          Iniciar sesión
        </Link>
        <a href="https://wa.me/56932508878" target="_blank" rel="noopener noreferrer" className="glass text-brand font-semibold px-5 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:border-accent/40">
          Ayuda por WhatsApp
        </a>
      </div>

      <div className="space-y-6">
        {/* PASO 1 — LOGIN */}
        <Step n={1} title="Entra a tu cuenta">
          <p>
            Abre <strong className="text-brand">diamantesvip.cl/admin/login</strong> desde tu
            celular o computador. Escribe el <strong className="text-brand">correo</strong> y la{' '}
            <strong className="text-brand">contraseña</strong> que te entregamos y presiona{' '}
            <strong className="text-brand">Iniciar Sesión</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Si aún no tienes cuenta, escríbenos por WhatsApp y te la creamos.</li>
            <li>Al ingresar llegas a tu <strong className="text-brand">panel</strong>, donde están tu perfil, tus fotos y tus historias.</li>
            <li>Guarda la página en tus favoritos para volver a entrar rápido.</li>
          </ul>
          <Shot src="/tutorial/login.png" alt="Pantalla de inicio de sesión" caption="Ingresa con tu correo y contraseña en /admin/login." />
        </Step>

        {/* PASO 2 */}
        <Step n={2} title="Completa tu perfil">
          <p>
            Ya dentro del panel, completa tus datos. Entra al menú{' '}
            <strong className="text-brand">Editar Perfil</strong>. Los campos marcados con{' '}
            <span className="text-accent font-semibold">*</span> son obligatorios:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-brand">Nombre real *</strong> — solo lo ve la administración, nunca se publica.</li>
            <li><strong className="text-brand">Alias</strong> — el nombre público con el que aparecerás.</li>
            <li><strong className="text-brand">Edad *</strong> y <strong className="text-brand">Ciudad *</strong>.</li>
            <li><strong className="text-brand">Apariencia física</strong> — nacionalidad, altura, medidas, color de cabello y ojos, etc. Mientras más completo, más visitas recibe tu perfil.</li>
            <li><strong className="text-brand">Descripción y servicios</strong> — cuéntalo de forma atractiva y clara.</li>
          </ul>
          <p>Cuando termines, presiona <strong className="text-brand">Guardar</strong> al final del formulario.</p>
          <Shot src="/tutorial/perfil.png" alt="Pantalla de edición de perfil" caption="Menú → Editar Perfil. Completa los campos y presiona Guardar." />
        </Step>

        {/* PASO 3 */}
        <Step n={3} title="Sube tus fotos">
          <p>
            Entra a <strong className="text-brand">Fotos y Videos</strong>. Presiona el botón para{' '}
            <strong className="text-brand">subir foto</strong> y elige una imagen de tu galería.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Puedes subir hasta <strong className="text-brand">9 fotos</strong>.</li>
            <li>Se suben <strong className="text-brand">de una en una</strong> (selecciona una, espera a que cargue, repite).</li>
            <li>Solo se permiten <strong className="text-brand">imágenes</strong> (JPG o PNG).</li>
            <li>Marca tu <strong className="text-brand">foto principal</strong>: es la que aparece primero en tu tarjeta del sitio.</li>
            <li>Para borrar una foto, usa el botón de eliminar sobre la imagen.</li>
          </ul>
          <Shot src="/tutorial/fotos.png" alt="Pantalla de subida de fotos" caption="Sube hasta 8 fotos y elige cuál será tu foto principal." />
        </Step>

        {/* PASO 4 */}
        <Step n={4} title="Sube historias y videos">
          <p>
            Las <strong className="text-brand">Historias</strong> son lo más visto del sitio.
            Entra a <strong className="text-brand">Historias</strong> y sube tu contenido.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Puedes subir hasta <strong className="text-brand">3 historias</strong>.</li>
            <li>Formatos permitidos: <strong className="text-brand">JPG, PNG o MP4</strong> (fotos o videos cortos).</li>
            <li>⏳ Las historias <strong className="text-brand">desaparecen automáticamente a las 24 horas</strong>. Súbelas seguido para mantenerte visible.</li>
          </ul>
          <Shot src="/tutorial/historias.png" alt="Pantalla de subida de historias" caption="Historias: fotos o videos MP4 que se borran solos en 24h." />
        </Step>

        {/* RECOMENDACIONES */}
        <div className="glass-luxe rounded-sm p-6 md:p-7">
          <h2 className="text-xl font-display text-brand mb-4">✨ Consejos para mejores resultados</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted text-sm leading-relaxed">
            <li><strong className="text-brand">Buena luz:</strong> la luz natural junto a una ventana siempre se ve mejor.</li>
            <li><strong className="text-brand">Fotos nítidas y verticales:</strong> evita imágenes borrosas o muy oscuras.</li>
            <li><strong className="text-brand">Variedad:</strong> combina fotos de cuerpo completo y de rostro/detalle.</li>
            <li><strong className="text-brand">Cuida tu privacidad:</strong> no incluyas tu número, dirección ni datos personales dentro de las fotos.</li>
            <li><strong className="text-brand">Actualiza seguido:</strong> los perfiles activos con historias frescas aparecen más arriba.</li>
          </ul>
        </div>

        {/* AYUDA */}
        <div className="glass-float rounded-sm p-6 text-center">
          <p className="text-muted text-sm mb-3">¿Tienes dudas o algún problema para subir tu material?</p>
          <a
            href="https://wa.me/56932508878"
            target="_blank"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
