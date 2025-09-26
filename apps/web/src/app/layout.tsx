import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jadapi',
  description: 'A modern web application built with Next.js and Express',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}