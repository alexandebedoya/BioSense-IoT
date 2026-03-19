/**
 * Funciones de autenticación JWT
 * Crear, verificar y decodificar tokens JWT
 */

// ✅ FIX LÍNEA 6
import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * Interfaz para payload del JWT
 */
export interface JWTPayload {
  id: string      // usuarioId
  email: string
  rol: string
  iat?: number    // Issued at
  exp?: number    // Expiration time
}

/**
 * Crear hash de contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error('[AUTH] Error hashing password:', error)
    throw new Error('Error procesando contraseña')
  }
}

/**
 * Comparar contraseña con hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('[AUTH] Error verifying password:', error)
    return false
  }
}

/**
 * Generar JWT token
 */
export function generateToken(payload: JWTPayload): string {
  try {
    return jwt.sign(
      payload,
      JWT_SECRET as jwt.Secret,
      {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      }
    )
  } catch (error) {
    console.error('[AUTH] Error generating token:', error)
    throw new Error('Error generando token')
  }
}

/**
 * Verificar JWT token
 */
// ✅ FIX LÍNEA 76
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded

  } catch (error: any) {

    if (error?.name === 'TokenExpiredError') {
      console.warn('[AUTH] Token expirado')

    } else if (error?.name === 'JsonWebTokenError') {
      console.warn('[AUTH] Token inválido:', error.message)

    } else {
      console.error('[AUTH] Error verifying token:', error)
    }

    return null
  }
}

/**
 * Extraer token del header Authorization
 * Expected: "Bearer <token>"
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Genera un código de reseteo de contraseña (simple pero seguro)
 */
export function generateResetCode(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

/**
 * Validar fortaleza de contraseña
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener mayúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener minúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener número')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Debe contener carácter especial (!@#$%^&*)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}