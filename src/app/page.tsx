import { redirect } from 'next/navigation'

// La raíz muestra el sitio directamente (antes había un splash "Pronto...").
export default function RootPage() {
  redirect('/home')
}
