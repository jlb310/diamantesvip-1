import type { Metadata } from "next"
import { Raleway } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { SiteChrome } from "@/components/SiteChrome"
import { RoutePreloader } from "@/components/RoutePreloader"

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://diamantesvip.cl'),
  title: {
    default: "Diamantes VIP - Diamantes en Chile",
    template: "%s | Diamantes VIP",
  },
  description:
    "Directorio de Diamantes en Chile. Encuentra perfiles verificados, ciudades y servicios en Diamantes VIP.",
  keywords: [
    "Diamante",
    "Diamantes",
    "Diamantes VIP",
    "diamantes chile",
    "diamantes vip chile",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png' }],
    shortcut: ['/icons/favicon-32.png'],
  },
  openGraph: {
    title: "Diamantes VIP - Diamantes en Chile",
    description:
      "Directorio de Diamantes en Chile con perfiles verificados y busqueda por ciudad.",
    url: "/",
    siteName: "Diamantes VIP",
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: '/logo-extendido.jpeg',
        width: 1200,
        height: 630,
        alt: 'Diamantes VIP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diamantes VIP - Diamantes en Chile',
    description:
      'Directorio de Diamantes en Chile con perfiles verificados y busqueda por ciudad.',
    images: ['/logo-extendido.jpeg'],
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
    "theme-color": "#F8E4E8",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${raleway.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#F8E4E8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Diamantes VIP" />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-foreground overflow-x-hidden">
        <SiteChrome>{children}</SiteChrome>
        <RoutePreloader />
        {/* Google tag (gtag.js) — afterInteractive: no bloquea la carga inicial */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KQ1GY490ND"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KQ1GY490ND');
          `}
        </Script>
      </body>
    </html>
  )
}
