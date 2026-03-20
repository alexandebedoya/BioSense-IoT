'use client'

import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { App } from '@capacitor/app'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' });

function DeepLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    // Solo registrar el listener en entorno de navegador/móvil
    if (typeof window !== 'undefined') {
      const initDeepLink = async () => {
        try {
          App.addListener('appUrlOpen', (data: any) => {
            console.log('[DEEP_LINK] URL abierta en la App:', data.url)
            
            // Ejemplo de URL: com.biosense.iot://oauth/callback?token=eyJ...
            const url = new URL(data.url)
            const token = url.searchParams.get('token')
            
            if (token) {
              console.log('[DEEP_LINK] Token detectado, procesando login...')
              localStorage.setItem('auth_token', token)
              
              // Redirigir a la página de callback para que procese el usuario
              // o directamente a la home si ya lo tenemos
              window.location.href = '/oauth/callback?token=' + token
            }
          })
        } catch (e) {
          console.warn('[DEEP_LINK] Capacitor App plugin no disponible (entorno Web)')
        }
      }

      initDeepLink()
    }

    return () => {
      App.removeAllListeners()
    }
  }, [router])

  return null
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <DeepLinkHandler />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
