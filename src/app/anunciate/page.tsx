'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const CITIES = ['Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'Antofagasta', 'La Serena']

const BENEFITS = [
  {
    title: 'Visibilidad Exclusiva',
    description: 'Tu perfil será visto por miles de usuarios que buscan acompañantes VIP en Chile. Destaca entre la competencia con fotos y videos.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Perfil Completo',
    description: 'Fotos, videos, medidas, servicios, horarios. Un perfil detallado genera más interés y confianza en los usuarios.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Panel de Control',
    description: 'Administra tu perfil, fotos y videos desde un panel simple. Actualiza tu información cuando quieras, sin intermediarios.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  },
  {
    title: 'Sello Verificada',
    description: 'Obtén el sello de verificación que genera confianza. Las Diamante verificadas reciben hasta 3x más visitas y contactos.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'WhatsApp Directo',
    description: 'Los usuarios te contactan directamente por WhatsApp desde tu perfil. Sin apps extra, sin intermediarios, sin vueltas.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Estadísticas',
    description: 'Accede a estadísticas de visitas a tu perfil. Conoce cuántas personas te ven y desde qué ciudades te buscan.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const PLANS = [
  {
    name: 'Silver',
    price: '$200.000',
    period: '/mes',
    features: [
      'Perfil con foto principal',
      'Descripción y servicios',
      'Contacto WhatsApp y teléfono',
      'Aparece en el listado',
      'Panel de control',
    ],
    highlighted: false,
  },
  {
    name: 'Gold',
    price: '$300.000',
    period: '/mes',
    features: [
      'Todo lo del plan Silver',
      'Fotos ilimitadas',
      'Videos en tu perfil',
      'Perfil destacado',
      'Estadísticas de visitas',
    ],
    highlighted: true,
  },
  {
    name: 'VIP',
    price: '$400.000',
    period: '/mes',
    features: [
      'Todo lo del plan Gold',
      'Prioridad en búsquedas',
      'Sello de verificación',
      'Aparece primero en portada',
      'Soporte prioritario',
    ],
    highlighted: false,
  },
]

export default function AnunciatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    alias: '',
    age: '',
    city: 'Santiago',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (parseInt(formData.age) < 18) {
      setError('Debes tener al menos 18 años para registrarte')
      return
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          alias: formData.alias,
          age: parseInt(formData.age),
          city: formData.city,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear la cuenta')
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al panel...')
      setTimeout(() => router.push('/admin/login?registered=true'), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose/20 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Hero */}
      <section className="relative pt-12 pb-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-rose/20 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative animate-in">
          <h1 className="text-4xl md:text-5xl font-display text-brand mb-6">
            Anúnciate
          </h1>
          <div className="mb-6 flex justify-center">
            <Image
              src="/anunciate1.jpeg"
              alt="Anúnciate en Diamantes VIP"
              width={448}
              height={560}
              className="h-auto w-full max-w-md rounded-[24px] shadow-lg"
              priority
            />
          </div>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed font-light">
            El directorio de acompañantes más exclusivo de Chile. Crea tu perfil,
            sube tus fotos y conecta con clientes de alto nivel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="#register"
              className="text-white font-semibold px-8 py-4 rounded-sm transition-all hover:scale-105 text-sm uppercase tracking-[0.15em] hover:shadow-lg"
              style={{ backgroundColor: '#db7581' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c5636f')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#db7581')}
            >
              Crear mi perfil gratis
            </a>
            <a
              href="#plans"
              className="font-semibold px-8 py-4 rounded-sm transition-all hover:scale-105 text-sm uppercase tracking-[0.15em]"
              style={{ backgroundColor: '#f9dade', color: '#727272' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2d0d8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9dade')}
            >
              Ver planes
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-20 px-4" style={{ backgroundColor: '#f9dade' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display text-center mb-3" style={{ color: '#727272' }}>
            ¿Por qué anunciarte con nosotros?
          </h2>
          <p className="text-center mb-14 max-w-xl mx-auto text-sm uppercase tracking-[0.08em]" style={{ color: '#8c8484' }}>
            Todo lo que necesitas para destacar
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white/80 backdrop-blur-sm rounded-[24px] p-6 shadow-sm group"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center mb-4 transition-all duration-400"
                  style={{ backgroundColor: '#f9dade', color: '#db7581' }}>
                  {benefit.icon}
                </div>
                <h3 className="text-base font-semibold mb-2 font-display" style={{ color: '#727272' }}>{benefit.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8c8484' }}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display text-center mb-3 text-brand">Planes</h2>
          <p className="text-muted-light text-center mb-14 text-sm uppercase tracking-[0.08em]">
            Elige el que mejor se adapte a ti
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[24px] p-6 transition-all duration-400 ${
                  plan.highlighted
                    ? 'bg-white shadow-xl relative scale-105 z-10 border-2 border-[#db7581]/30'
                    : 'bg-white/80 backdrop-blur-sm shadow-sm border border-white/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-[0.12em] shadow-lg"
                    style={{ backgroundColor: '#db7581' }}>
                    Recomendado
                  </div>
                )}
                <h3 className="text-xl font-display mb-2 text-center" style={{ color: '#727272' }}>{plan.name}</h3>
                <div className="mb-6 text-center">
                  <span className="text-3xl font-display" style={{ color: '#db7581' }}>{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-light text-sm ml-1">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: '#8c8484' }}>
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#db7581' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#register"
                  className="block text-center font-semibold py-3 rounded-xl transition-all text-sm uppercase tracking-[0.1em] hover:scale-[1.02]"
                  style={plan.highlighted
                    ? { backgroundColor: '#db7581', color: '#ffffff' }
                    : { backgroundColor: '#f9dade', color: '#727272' }
                  }
                >
                  Comenzar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-20 px-4" style={{ backgroundColor: '#f9dade' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display text-center mb-3" style={{ color: '#727272' }}>
            ¿Cómo funciona?
          </h2>
          <p className="text-center mb-14 max-w-xl mx-auto text-sm uppercase tracking-[0.08em]" style={{ color: '#8c8484' }}>
            Simple, rápido y sin complicaciones
          </p>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Regístrate', desc: 'Crea tu cuenta con email y contraseña. Gratis, toma menos de 2 minutos.' },
              { step: '02', title: 'Completa tu perfil', desc: 'Agrega fotos, descripción, servicios, medidas y horarios.' },
              { step: '03', title: 'Verificación', desc: 'Solicita el sello de verificación para generar más confianza.' },
              { step: '04', title: 'Recibe contactos', desc: 'Tu perfil será visible para miles de usuarios en todo Chile.' },
            ].map((item, i) => (
              <div
                key={item.step}
                className="flex items-center gap-5 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all duration-400"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-serif"
                  style={{ backgroundColor: '#db7581', color: '#ffffff' }}
                >
                  {item.step}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold mb-0.5" style={{ color: '#727272' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8c8484' }}>{item.desc}</p>
                </div>
                <div className="flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <svg className="w-5 h-5" style={{ color: '#db7581' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register form */}
      <section id="register" className="py-12 md:py-20 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-display text-center mb-2 text-brand">Crea tu cuenta</h2>
          <p className="text-muted-light text-center mb-8 text-sm uppercase tracking-[0.08em]">
            Empieza a recibir contactos hoy
          </p>

          {error && (
            <div className="bg-accent/10 border border-accent/30 text-accent px-4 py-3 rounded-sm mb-6 text-center text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-accent/5 border border-accent/20 text-accent px-4 py-3 rounded-sm mb-6 text-center text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass-luxe rounded-sm p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm"
                  required placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Contraseña *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm"
                  required minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Nombre real *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm"
                  required />
              </div>
              <div>
                <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Alias (público)</label>
                <input type="text" name="alias" value={formData.alias} onChange={handleChange}
                  className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm"
                  placeholder="Tu nombre artístico" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Edad *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange}
                  className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm"
                  required min={18} max={99} />
              </div>
              <div>
                <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Ciudad *</label>
                <select name="city" value={formData.city} onChange={handleChange}
                  className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm">
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-muted-light mb-1.5 text-xs uppercase tracking-[0.1em] font-semibold">Confirmar contraseña *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                className="w-full bg-surface-alt/80 backdrop-blur-sm text-brand px-4 py-3 rounded-sm border border-border/60 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all text-sm"
                required placeholder="Repite tu contraseña" />
            </div>

            <p className="text-[11px] text-muted-light text-center pt-2">
              Al registrarte aceptas nuestros términos. Debes ser mayor de edad.
            </p>

            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-sm transition-all disabled:opacity-50 text-sm uppercase tracking-[0.12em] hover:shadow-lg hover:shadow-accent/20">
              {loading ? 'Creando cuenta...' : 'Crear mi perfil gratis'}
            </button>
          </form>

          <p className="text-center text-muted-light mt-6 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/admin/login" className="text-accent hover:text-accent-hover font-medium underline underline-offset-4">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-display text-brand mb-3">¿Tienes dudas?</h2>
          <p className="text-muted-light mb-8 text-sm">
            Escríbenos por WhatsApp y te ayudamos a crear tu perfil
          </p>
          <a
            href="https://wa.me/56900000000?text=Hola,%20quiero%20anunciarme%20en%20Diamantes%20VIP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 glass-float rounded-full px-8 py-4 text-sm font-semibold text-brand hover:text-accent transition-all duration-400 hover:scale-105"
          >
            <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
