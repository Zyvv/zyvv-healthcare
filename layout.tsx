// ============================================================
// ZYVV — Root Layout
// File: app/layout.tsx
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// ── Fonts ────────────────────────────────────────────────────
// Inter: body copy and UI. Variable weight for flexibility.
// JetBrains Mono: labels, badges, door type slugs.
// Both loaded via next/font — zero layout shift, self-hosted.

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// ── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL('https://zyvv.app'),

  title: {
    default: 'ZYVV — Three Doors for Every Decision',
    template: '%s | ZYVV',
  },

  description:
    'Drop your situation. Get roasted. Choose a door. ZYVV generates three unexpected paths through any decision — conventional, contrarian, or alien.',

  keywords: [
    'decision making',
    'life advice',
    'career decisions',
    'AI advisor',
    'three doors',
    'ZYVV',
  ],

  authors: [{ name: 'ZYVV' }],

  // ── Open Graph ───────────────────────────────────────────
  openGraph: {
    type: 'website',
    url: 'https://zyvv.app',
    siteName: 'ZYVV',
    title: 'ZYVV — Three Doors for Every Decision',
    description:
      'Drop your situation. Get roasted. Choose a door.',
    images: [
      {
        url: '/og.png',         // 1200×630 — add to /public
        width: 1200,
        height: 630,
        alt: 'ZYVV — Three Doors for Every Decision',
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'ZYVV — Three Doors for Every Decision',
    description: 'Drop your situation. Get roasted. Choose a door.',
    images: ['/og.png'],
    site: '@zyvvapp',
    creator: '@zyvvapp',
  },

  // ── Icons ────────────────────────────────────────────────
  // Add favicon.ico + apple-touch-icon.png to /public
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // ── Robots ──────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

// ── Viewport ─────────────────────────────────────────────────
// Exported separately per Next.js 14 convention.
// theme-color matches the black canvas so the browser chrome
// blends into the UI on mobile.

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,        // Prevent pinch-zoom breaking the layout
  userScalable: false,
  themeColor: '#000000',
}

// ============================================================
// ROOT LAYOUT
// ============================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
