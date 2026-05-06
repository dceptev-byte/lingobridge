import type { Metadata } from 'next'
import { Baloo_2, Be_Vietnam_Pro, Mukta } from 'next/font/google'
import { PostHogProvider } from '../components/analytics/PostHogProvider'
import './globals.css'

const baloo2 = Baloo_2({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-baloo2',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam-pro',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const mukta = Mukta({
  subsets: ['latin', 'devanagari'],
  variable: '--font-mukta',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lingobridge — Learn Hindi & Vietnamese',
  description: 'Bridge languages, bridge cultures. Learn Hindi and Vietnamese with Lingobridge.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${baloo2.variable} ${beVietnamPro.variable} ${mukta.variable} font-body antialiased`}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
