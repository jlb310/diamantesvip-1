'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function DevLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'escort'

  useEffect(() => {
    fetch(`/api/dev/login?role=${role}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/admin')
      })
      .catch((err) => {
        console.error('Dev login error:', err)
      })
  }, [role, router])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Ingresando como {role === 'admin' ? 'Admin' : 'Diamante'}...</p>
      </div>
    </div>
  )
}

export default function DevLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <DevLoginContent />
    </Suspense>
  )
}
