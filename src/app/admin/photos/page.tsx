'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { webpUrl } from '@/lib/webp'

interface Photo {
  id: string
  url: string
  order: number
}

interface Video {
  id: string
  url: string
  thumbnail: string | null
  order: number
}

const MAX_PHOTOS = 9
const MAX_VIDEOS = 6

export default function PhotoManager() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    Promise.all([fetchPhotos(), fetchVideos()]).then(() => setLoading(false))
  }, [router])

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/admin/photos', { headers: authHeaders() })
      const data = await res.json()
      if (data.photos) setPhotos(data.photos)
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos', { headers: authHeaders() })
      const data = await res.json()
      if (data.videos) setVideos(data.videos)
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (photos.length >= MAX_PHOTOS) {
      setMessage(`Máximo ${MAX_PHOTOS} fotos permitidas`)
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', files[0])

    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setPhotos([...photos, data.photo])
        setMessage('Foto subida correctamente')
      } else {
        setMessage(data.error || 'Error al subir foto')
      }
    } catch (error) {
      setMessage('Error al subir foto')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    try {
      const res = await fetch(`/api/admin/photos?id=${photoId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        setMessage('Foto eliminada')
      } else {
        setMessage('Error al eliminar foto')
      }
    } catch (error) {
      setMessage('Error al eliminar foto')
    }
  }

  const handleSetMain = async (photoId: string) => {
    try {
      const res = await fetch('/api/admin/photos/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ photoId }),
      })
      if (res.ok) {
        setMessage('Foto principal actualizada')
        fetchPhotos()
      } else {
        setMessage('Error al actualizar')
      }
    } catch (error) {
      setMessage('Error al actualizar')
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (videos.length >= MAX_VIDEOS) {
      setMessage(`Máximo ${MAX_VIDEOS} videos permitidos`)
      return
    }

    setUploadingVideo(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', files[0])

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setVideos([...videos, data.video])
        setMessage('Video subido correctamente')
      } else {
        setMessage(data.error || 'Error al subir video')
      }
    } catch (error) {
      setMessage('Error al subir video')
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const handleVideoDelete = async (videoId: string) => {
    try {
      const res = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.ok) {
        setVideos(videos.filter(v => v.id !== videoId))
        setMessage('Video eliminado')
      } else {
        setMessage('Error al eliminar video')
      }
    } catch (error) {
      setMessage('Error al eliminar video')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-accent">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/admin" className="text-accent hover:text-accent-hover mb-6 inline-block text-sm">
          ← Volver al panel
        </Link>

        <h1 className="text-3xl font-display text-brand mb-2">Fotos y Videos</h1>
        <p className="text-muted mb-6">{photos.length}/{MAX_PHOTOS} fotos · {videos.length}/{MAX_VIDEOS} videos</p>

        {message && (
          <div className={`mb-6 px-4 py-2 rounded-none text-center text-sm ${message.includes('Error') || message.includes('Máximo') ? 'bg-accent/10 border border-accent text-accent' : 'bg-accent/5 border border-border text-accent'}`}>
            {message}
          </div>
        )}

        {/* ---------- FOTOS ---------- */}
        <h2 className="text-lg font-display text-brand mb-3">Fotos de la galería</h2>
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            disabled={uploading || photos.length >= MAX_PHOTOS}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || photos.length >= MAX_PHOTOS}
            className="w-full glass-card border-2 border-dashed border-border hover:border-accent py-8 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted text-sm"
          >
            {uploading ? 'Subiendo...' : photos.length >= MAX_PHOTOS
              ? `Máximo ${MAX_PHOTOS} fotos`
              : 'Click para subir foto'}
          </button>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square bg-surface-container rounded-none overflow-hidden group border border-border">
                <Image
                  src={webpUrl(photo.url)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-brand/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSetMain(photo.id)}
                    className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3 py-1 rounded-none uppercase tracking-wider"
                  >
                    Principal
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="bg-accent border border-border text-white text-xs font-bold px-3 py-1 rounded-none uppercase tracking-wider"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-light text-sm mb-10">
            No hay fotos todavía
          </div>
        )}

        {/* ---------- VIDEOS ---------- */}
        <h2 className="text-lg font-display text-brand mb-3">Videos de la galería</h2>
        <div className="mb-6">
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploadingVideo || videos.length >= MAX_VIDEOS}
            className="hidden"
          />
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={uploadingVideo || videos.length >= MAX_VIDEOS}
            className="w-full glass-card border-2 border-dashed border-border hover:border-accent py-8 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted text-sm"
          >
            {uploadingVideo ? 'Subiendo...' : videos.length >= MAX_VIDEOS
              ? `Máximo ${MAX_VIDEOS} videos`
              : 'Click para subir video (MP4, WebM o MOV · máx 20MB)'}
          </button>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="relative aspect-square bg-surface-container rounded-none overflow-hidden group border border-border">
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-brand/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleVideoDelete(video.id)}
                    className="bg-accent border border-border text-white text-xs font-bold px-3 py-1 rounded-none uppercase tracking-wider"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-light text-sm">
            No hay videos todavía
          </div>
        )}
      </div>
    </div>
  )
}
