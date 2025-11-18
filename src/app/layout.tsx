import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ninma hub - Sistema de Gestão de Eventos',
  description: 'Sistema completo de gestão de eventos acadêmicos, envio de trabalhos e certificados digitais',
  keywords: ['eventos', 'acadêmico', 'gestão', 'certificados', 'trabalhos'],
  authors: [{ name: 'Oryum Tech', url: 'https://oryumtech.com' }],
  creator: 'Oryum Tech',
  publisher: 'ninma hub - UFN',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'ninma hub - Sistema de Gestão de Eventos',
    description: 'Sistema completo de gestão de eventos acadêmicos',
    siteName: 'ninma hub',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
