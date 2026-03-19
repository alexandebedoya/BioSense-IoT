'use client'

import { useState, useCallback, useEffect } from 'react'
import { UsuarioPublico, LoginRequest, RegisterRequest, AuthContext } from '@/lib/types'
import { getApiUrl } from '@/lib/api-config'

/**
 * Hook para manejar autenticación en toda la app
 * Conectado con el backend de Spring Boot (Puerto 8080)
 */
export function useAuth(): AuthContext {
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAutenticado, setIsAutenticado] = useState(false)

  // ======================== CARGAR STATE DEL STORAGE ========================
  useEffect(() => {
    const cargarAuth = () => {
      try {
        const tokenGuardado = localStorage.getItem('auth_token')
        const usuarioGuardado = localStorage.getItem('auth_usuario')

        if (tokenGuardado && usuarioGuardado) {
          setToken(tokenGuardado)
          setUsuario(JSON.parse(usuarioGuardado))
          setIsAutenticado(true)
        }
      } catch (error) {
        console.error('[AUTH] Error cargando auth desde storage:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    cargarAuth()
  }, [])

  // ======================== LOGIN ========================
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)

        const response = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password } as LoginRequest),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Error en login')
        }

        // Estructura de Spring Boot: { token, usuario, message }
        setToken(data.token)
        setUsuario(data.usuario)
        setIsAutenticado(true)

        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_usuario', JSON.stringify(data.usuario))

        console.log('[AUTH] ✅ Login exitoso')
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : 'Error desconocido'
        console.error('[AUTH] Error en login:', mensaje)
        logout()
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // ======================== REGISTER ========================
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true)

        if (data.password !== data.confirmPassword) {
          throw new Error('Las contraseñas no coinciden')
        }

        const response = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Error en registro')
        }

        setToken(responseData.token)
        setUsuario(responseData.usuario)
        setIsAutenticado(true)

        localStorage.setItem('auth_token', responseData.token)
        localStorage.setItem('auth_usuario', JSON.stringify(responseData.usuario))

        console.log('[AUTH] ✅ Registro exitoso')
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : 'Error desconocido'
        console.error('[AUTH] Error en registro:', mensaje)
        logout()
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // ======================== GOOGLE LOGIN ========================
  // El login de Google se maneja redirigiendo al backend de Spring Boot directamente
  const googleLogin = useCallback(async () => {
    try {
      setIsLoading(true)
      // Endpoint de Spring Boot OAuth2 (Redirige a Google)
      window.location.href = getApiUrl('/oauth2/authorization/google')
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[AUTH] Error en Google login:', mensaje)
      setIsLoading(false)
      throw error
    }
  }, [])

  // ======================== LOGOUT ========================
  const logout = useCallback(() => {
    setToken(null)
    setUsuario(null)
    setIsAutenticado(false)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_usuario')
    console.log('[AUTH] 🚪 Sesión cerrada')
  }, [])

  return {
    usuario,
    token,
    isLoading,
    isAutenticado,
    login,
    register,
    googleLogin,
    logout,
  }
}

/**
 * Hook para obtener token
 */
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('auth_token'))
  }, [])

  return token
}

/**
 * Helper para hacer fetch con autenticación
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  token?: string | null
) {
  const authToken = token || localStorage.getItem('auth_token')

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
  })
}
