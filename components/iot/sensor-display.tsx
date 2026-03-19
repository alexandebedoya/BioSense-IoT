'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CN } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface SensorDisplayProps {
  name: string
  label: string
  value: number
  unit: string
  icon: LucideIcon
  safeLimit: number
  warningLimit?: number
  color: 'orange' | 'sky' | 'green' | 'red'
  lastUpdated?: number
}

const COLOR_VARIANTS = {
  orange: {
    card: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    icon: 'text-orange-600',
    text: 'text-orange-900',
    label: 'text-orange-700',
    badge: 'bg-orange-500',
  },
  sky: {
    card: 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200',
    icon: 'text-sky-600',
    text: 'text-sky-900',
    label: 'text-sky-700',
    badge: 'bg-sky-500',
  },
  green: {
    card: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900',
    label: 'text-green-700',
    badge: 'bg-green-500',
  },
  red: {
    card: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900',
    label: 'text-red-700',
    badge: 'bg-red-500',
  },
}

export function SensorDisplay({
  name,
  label,
  value,
  unit,
  icon: Icon,
  safeLimit,
  warningLimit,
  color,
  lastUpdated,
}: SensorDisplayProps) {
  const colors = COLOR_VARIANTS[color]

  // Determinar estado
  let status = 'NORMAL'
  let statusColor = 'bg-green-500'
  if (warningLimit && value >= warningLimit) {
    status = 'ALERTA'
    statusColor = 'bg-orange-500'
  }
  if (value >= safeLimit) {
    status = 'PELIGRO'
    statusColor = 'bg-red-500'
  }

  return (
    <Card className={`p-4 ${colors.card}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${colors.icon}`} />
            <span className={`font-semibold text-sm ${colors.text}`}>{name}</span>
          </div>
          <Badge className={`${colors.badge} text-white text-xs`}>{label}</Badge>
        </div>

        {/* Valor */}
        <div>
          <p className={`text-xs ${colors.label} mb-1`}>{label}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
          <p className={`text-xs ${colors.label} mt-1`}>{unit}</p>
        </div>

        {/* Estado */}
        <div className="pt-2 border-t border-opacity-20 border-current">
          <div className="flex items-center justify-between">
            <p className={`text-xs ${colors.label}`}>Límite: {safeLimit} {unit}</p>
            <Badge className={`${statusColor} text-white text-xs`}>{status}</Badge>
          </div>
        </div>

        {/* Timestamp */}
        {lastUpdated && (
          <p className={`text-xs ${colors.label} text-opacity-75`}>
            {new Date(lastUpdated).toLocaleTimeString('es-ES')}
          </p>
        )}
      </div>
    </Card>
  )
}
