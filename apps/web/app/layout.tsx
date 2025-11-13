import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata, Viewport } from 'next'

import "@workspace/ui/globals.css"
import { Providers } from '../components/providers'
import Footer from '../components/layout/Footer'

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'),
  title: {
    default: 'Jaddpi - Fast & Reliable Delivery Service',
    template: '%s | Jaddpi'
  },
  description: 'Professional courier and delivery service. Track your packages in real-time with our fast, reliable, and eco-friendly delivery solutions.',
  keywords: ['delivery', 'courier', 'shipping', 'logistics', 'tracking', 'fast delivery', 'same-day delivery'],
  authors: [{ name: 'Jaddpi' }],
  creator: 'Jaddpi',
  publisher: 'Jaddpi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Jaddpi',
    title: 'Jaddpi - Fast & Reliable Delivery Service',
    description: 'Professional courier and delivery service. Track your packages in real-time.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jaddpi Delivery Service',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jaddpi - Fast & Reliable Delivery Service',
    description: 'Professional courier and delivery service. Track your packages in real-time.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
