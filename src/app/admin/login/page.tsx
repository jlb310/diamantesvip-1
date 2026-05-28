'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Credenciales inválidas')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/admin')
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-md p-8 glass-card">
        <h1 className="text-3xl font-bold text-accent text-center font-serif mb-8">Diamantes VIP</h1>
        <h2 className="text-xl font-bold text-brand text-center mb-6 font-serif">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-accent/10 border border-accent text-accent px-4 py-2 rounded-none text-center text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-muted-light mb-2 text-sm uppercase tracking-wider font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container text-brand px-4 py-3 rounded-none border border-border focus:border-accent outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-muted-light mb-2 text-sm uppercase tracking-wider font-semibold">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container text-brand px-4 py-3 rounded-none border border-border focus:border-accent outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-none transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border/40">
          <p className="text-center text-muted text-xs mb-3">Credenciales de demo</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@diamantes.vip')
                setPassword('admin123')
              }}
              className="w-full text-left px-3 py-2 bg-surface-container rounded-sm text-xs text-muted hover:text-brand transition-colors"
            >
              <span className="font-semibold">Admin:</span> admin@diamantes.vip / admin123
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('valentina@diamantes.vip')
                setPassword('demo1234')
              }}
              className="w-full text-left px-3 py-2 bg-surface-container rounded-sm text-xs text-muted hover:text-brand transition-colors"
            >
              <span className="font-semibold">Diamante:</span> valentina@diamantes.vip / demo1234
            </button>
          </div>
        </div>

        <p className="text-center text-muted mt-6 text-sm">
          ¿No tienes cuenta?{' '}
          <a href="/admin/register" className="text-accent hover:text-accent-hover font-medium">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  )
}
