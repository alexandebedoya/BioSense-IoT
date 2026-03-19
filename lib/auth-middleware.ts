/**
 * Middleware para proteger rutas API
 * Verifica que el usuario tenga un token JWT válido
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'
import { ApiResponse } from '@/lib/types'

/**
 * Verificar autenticación
 * Uso en endpoints: if (!verificarAuth(req)) return response
 */
export function verificarAuth(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Token no proporcionado',
      } as ApiResponse,
      { status: 401 }
    )
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        error: 'Token inválido o expirado',
      } as ApiResponse,
      { status: 401 }
    )
  }

  return null
}

/**
 * Middleware para NextJS (app directory)
 * Aplicar a rutas protegidas
 */
export async function protectedRouteHandler(
  req: NextRequest,
  handler: (req: NextRequest, payload: any) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'No autenticado',
      } as ApiResponse,
      { status: 401 }
    )
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        error: 'Token expirado',
      } as ApiResponse,
      { status: 401 }
    )
  }

  // Pasar el payload al handler
  return handler(req, payload)
}
