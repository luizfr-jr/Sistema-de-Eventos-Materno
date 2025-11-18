import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

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
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
