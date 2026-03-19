'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      console.log('[OAUTH] Token recibido, guardando...')
      localStorage.setItem('auth_token', token)
      
      // Intentar obtener los datos del usuario para completar el login
      const fetchUserData = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/auth/validate', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            localStorage.setItem('auth_usuario', JSON.stringify(data.usuario))
            console.log('[OAUTH] Usuario guardado, redirigiendo...')
          }
        } catch (error) {
          console.error('[OAUTH] Error validando token:', error)
        } finally {
          // Siempre redirigir a la home/dashboard
          window.location.href = '/'
        }
      }
      
      fetchUserData()
    } else {
      console.error('[OAUTH] No se encontró token en la URL')
      router.push('/?error=no_token')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-medium">Finalizando sesión...</h1>
      <p className="text-muted-foreground mt-2">Por favor espera un momento.</p>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}
