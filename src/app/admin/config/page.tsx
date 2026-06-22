'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ConfigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ contactWhatsapp: '', contactEmail: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/admin/login')
      return
    }
    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      router.push('/admin')
      return
    }
    fetch('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.config) {
          setForm({
            contactWhatsapp: d.config.contactWhatsapp || '',
            contactEmail: d.config.contactEmail || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      setMessage(res.ok ? 'Cambios guardados correctamente' : 'Error al guardar')
    } catch {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass =
    'w-full rounded-sm border border-border/30 bg-white px-4 py-2.5 text-sm text-brand focus:border-accent focus:outline-none transition-colors'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-accent hover:text-accent-hover mb-6 inline-block text-sm transition-colors">
        ← Volver al panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand font-serif italic mb-1">Configuración</h1>
        <p className="text-muted-light text-sm uppercase tracking-[0.06em]">Datos de contacto del sitio</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-float rounded-sm p-6 md:p-7 space-y-5">
        <div>
          <label className="block text-muted-light mb-2 text-sm uppercase tracking-wider font-semibold">
            WhatsApp de contacto
          </label>
          <input
            type="text"
            name="contactWhatsapp"
            value={form.contactWhatsapp}
            onChange={handleChange}
            className={inputClass}
            placeholder="56932508878"
          />
          <p className="text-xs text-muted-light mt-1">
            Solo números, con código de país y sin signo +. Ejemplo: 56932508878
          </p>
        </div>

        <div>
          <label className="block text-muted-light mb-2 text-sm uppercase tracking-wider font-semibold">
            Correo de contacto
          </label>
          <input
            type="email"
            name="contactEmail"
            value={form.contactEmail}
            onChange={handleChange}
            className={inputClass}
            placeholder="contacto@diamantesvip.cl"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-sm text-xs uppercase tracking-[0.1em] transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {message && (
            <span className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
