'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TopBar } from '@/components/TopBar'
import { InstallPrompt } from '@/components/InstallPrompt'
import { AgeGate } from '@/components/AgeGate'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isAdmin = pathname.startsWith('/admin')

  if (isLanding) {
    return <>{children}</>
  }

  return (
    <>
      <TopBar />
      <Header />
      {children}
      <Footer />
      <InstallPrompt />
      {!isAdmin && <AgeGate />}
    </>
  )
}
