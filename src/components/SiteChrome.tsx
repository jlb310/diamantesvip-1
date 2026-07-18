'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TopBar } from '@/components/TopBar'
import { InstallPrompt } from '@/components/InstallPrompt'
import { AgeGate } from '@/components/AgeGate'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

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
