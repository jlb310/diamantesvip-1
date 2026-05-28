import type { Metadata } from "next"
import { Public_Sans, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { SiteChrome } from "@/components/SiteChrome"

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://diamantesvip.cl'),
  title: {
    default: "Diamantes VIP - Acompanantes y scort en Chile",
    template: "%s | Diamantes VIP",
  },
  description:
    "Directorio de acompanantes y scort en Chile. Encuentra perfiles verificados, ciudades y servicios en Diamantes VIP.",
  keywords: [
    "scort",
    "acompanante",
    "acompanantes",
    "escort",
    "escort chile",
    "acompanantes chile",
    "diamantes vip",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/favicono.png', type: 'image/png' },
      { url: '/favicon.jpeg', type: 'image/jpeg' },
    ],
    apple: [{ url: '/favicono.png' }],
    shortcut: ['/favicono.png'],
  },
  openGraph: {
    title: "Diamantes VIP - Acompanantes y scort en Chile",
    description:
      "Directorio de acompanantes y scort en Chile con perfiles verificados y busqueda por ciudad.",
    url: "/",
    siteName: "Diamantes VIP",
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: '/logo_diamantes_pronto.png',
        width: 1200,
        height: 1200,
        alt: 'Diamantes VIP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diamantes VIP - Acompanantes y scort en Chile',
    description:
      'Directorio de acompanantes y scort en Chile con perfiles verificados y busqueda por ciudad.',
    images: ['/logo_diamantes_pronto.png'],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Diamantes VIP",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#221d1d",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${publicSans.variable} ${cormorant.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#221d1d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Diamantes VIP" />
        <link rel="apple-touch-icon" href="/favicono.png" />
        <link rel="icon" type="image/png" href="/favicono.png" />
        <link rel="shortcut icon" href="/favicono.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-foreground overflow-x-hidden">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
