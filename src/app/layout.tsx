import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDF Tool Pro - Professional PDF Processing',
  description: 'Split, merge, convert, compress, and edit PDFs with ease. Professional-grade PDF tools for everyone.',
  keywords: ['PDF', 'split PDF', 'merge PDF', 'convert PDF', 'compress PDF', 'PDF tools'],
  authors: [{ name: 'PDF Tool Pro' }],
  openGraph: {
    title: 'PDF Tool Pro - Professional PDF Processing',
    description: 'Split, merge, convert, compress, and edit PDFs with ease.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
