/**
 * Configuración de la API
 * En desarrollo: http://localhost:8080 (Spring Boot Backend)
 * En producción: URL del servidor Spring Boot
 */

const API_URL_DEVELOPMENT = 'http://localhost:8080'
const API_URL_PRODUCTION = process.env.NEXT_PUBLIC_API_URL || 'https://biosense-iot-production.up.railway.app'

export function getApiBaseUrl(): string {
  // 1. Forzar producción si estamos en un dispositivo móvil (Capacitor)
  // @ts-ignore
  if (typeof window !== 'undefined' && (window.Capacitor || window.location.protocol === 'capacitor:')) {
    return API_URL_PRODUCTION;
  }

  // 2. Cliente - navegador normal
  if (process.env.NODE_ENV === 'production' || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    return API_URL_PRODUCTION;
  }

  return API_URL_DEVELOPMENT;
}

export function getApiUrl(endpoint: string) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
}
// Borra cualquier otro "return" que haya quedado suelto abajo
