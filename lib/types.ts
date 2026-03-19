export type AirQualityLevel = 'NORMAL' | 'PRECAUCION' | 'PELIGRO'

export interface SensorData {
  mq4: number
  mq7: number
  mq135: number
  nivel: AirQualityLevel
  timestamp: string
}

export interface Alert {
  id: string
  type: 'warning' | 'danger'
  message: string
  sensor: 'MQ4' | 'MQ7' | 'SISTEMA'
  timestamp: string
  resolved: boolean
  value?: number
}

export interface HistoricalDataPoint {
  timestamp: string
  mq4: number
  mq7: number
}

export interface SensorInfo {
  id: 'mq4' | 'mq7' | 'mq135'
  name: string
  description: string
  unit: string
  safeMax: number
  warningMax: number
  icon: string
}

export const SENSOR_INFO: Record<'mq4' | 'mq7' | 'mq135', SensorInfo> = {
  mq4: {
    id: 'mq4',
    name: 'MQ-4',
    description: 'Sensor de Metano (CH4)',
    unit: 'ppm',
    safeMax: 300,
    warningMax: 500,
    icon: 'flame'
  },
  mq7: {
    id: 'mq7',
    name: 'MQ-7',
    description: 'Sensor de Monóxido de Carbono (CO)',
    unit: 'ppm',
    safeMax: 200,
    warningMax: 400,
    icon: 'cloud'
  },
  mq135: {
    id: 'mq135',
    name: 'MQ-135',
    description: 'Sensor de Calidad del Aire (NOx, NH3, aromáticos)',
    unit: 'ppm',
    safeMax: 350,
    warningMax: 600,
    icon: 'wind'
  }
}

export const THRESHOLDS = {
  mq4: {
    safe: 300,
    warning: 500
  },
  mq7: {
    safe: 200,
    warning: 400
  },
  mq135: {
    safe: 350,
    warning: 600
  }
}

export function getAirQualityLevel(mq4: number, mq7: number, mq135?: number): AirQualityLevel {
  // El nivel se determina por el peor de los sensores
  const sensors = [mq4, mq7, mq135 || 0]
  
  if (sensors.some(v => v > THRESHOLDS.mq4.warning || v > THRESHOLDS.mq7.warning || v > THRESHOLDS.mq135.warning)) {
    return 'PELIGRO'
  }
  if (sensors.some(v => v > THRESHOLDS.mq4.safe || v > THRESHOLDS.mq7.safe || v > THRESHOLDS.mq135.safe)) {
    return 'PRECAUCION'
  }
  return 'NORMAL'
}

export function getSensorStatus(value: number, sensor: 'mq4' | 'mq7' | 'mq135'): AirQualityLevel {
  const threshold = THRESHOLDS[sensor]
  if (value > threshold.warning) return 'PELIGRO'
  if (value > threshold.safe) return 'PRECAUCION'
  return 'NORMAL'
}

// ======================== AUTENTICACIÓN ========================
export interface AuthResponse {
  token: string
  usuario: UsuarioPublico
}

export interface UsuarioPublico {
  id: string
  email: string
  nombre: string
  rol: string
  activo: boolean
  verificado: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  nombre: string
  password: string
  confirmPassword: string
}

export interface AuthContext {
  usuario: UsuarioPublico | null
  token: string | null
  isLoading: boolean
  isAutenticado: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  googleLogin: () => Promise<void>
  logout: () => void
}

// ======================== API RESPONSES ========================
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}
