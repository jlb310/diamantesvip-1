import { redirect } from 'next/navigation'

// El home ahora vive en la raíz (/). Mantenemos /home como redirect permanente
// para links antiguos, preservando los query params (?tier=, ?q=, ?toggles=).
interface HomeRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomeRedirect({ searchParams }: HomeRedirectProps) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value)
    else if (Array.isArray(value)) for (const v of value) qs.append(key, v)
  }
  const query = qs.toString()
  redirect(query ? `/?${query}` : '/')
}
