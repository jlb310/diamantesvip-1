'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const MAX_STORIES = 3

export default function HistoriasManager() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    setLoading(false)
  }, [router])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setMessage('')

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/historias', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Historia subida correctamente')
      } else {
        setMessage(data.error || 'Error al subir')
      }
    } catch {
      setMessage('Error al subir')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-accent text-sm">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/admin" className="text-accent hover:text-accent-hover mb-6 inline-block text-sm transition-colors">
        ← Volver al panel
      </Link>

      <div className="animate-in">
        <h1 className="text-3xl font-display text-brand mb-1">Historias</h1>
        <p className="text-muted-light text-sm uppercase tracking-[0.06em] mb-8">
          Sube fotos y videos temporales. Desaparecen en 24 horas.
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-sm text-center text-sm ${message.includes('Error') ? 'bg-accent/10 border border-accent/30 text-accent' : 'bg-accent/5 border border-accent/20 text-accent'}`}>
          {message}
        </div>
      )}

      <div className="glass-luxe rounded-sm p-10 text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-display text-brand mb-2">Subir Historia</h2>
        <p className="text-muted-light text-sm mb-6">Máximo {MAX_STORIES} historias. Formatos: JPG, PNG, MP4.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-sm text-sm uppercase tracking-[0.1em] transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-accent/20"
        >
          {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
        </button>

        <p className="text-muted-light text-xs mt-8">
          Las historias se mostrarán en la sección &quot;Últimas Historias&quot; del inicio.
          <br />
          Se eliminan automáticamente después de 24 horas.
        </p>
      </div>

      {/* Placeholder for story list (future) */}
      <div className="mt-8 glass rounded-sm p-6 text-center">
        <p className="text-muted-light text-sm">
          Próximamente: vista previa y gestión de historias activas.
        </p>
      </div>
    </div>
  )
}
