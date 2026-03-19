/**
 * Configuración de la API
 * En desarrollo: http://localhost:8080 (Spring Boot Backend)
 * En producción: URL del servidor Spring Boot
 */

const API_URL_DEVELOPMENT = 'http://localhost:8080'
const API_URL_PRODUCTION = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // SSR - servidor
    return API_URL_DEVELOPMENT
  }

  // Cliente - navegador
  if (process.env.NODE_ENV === 'production') {
    return API_URL_PRODUCTION
  }

  return API_URL_DEVELOPMENT
}

export function getApiUrl(endpoint: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}
// Borra cualquier otro "return" que haya quedado suelto abajo
