'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Flame, Cloud, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AlertItem {
  id: string
  sensorName: 'MQ-4' | 'MQ-7' | 'MQ-135'
  sensorIcon: 'flame' | 'cloud' | 'wind'
  level: 'NORMAL' | 'PRECAUCION' | 'PELIGRO'
  value: number
  timestamp: number
  description: string
}

interface SensorAlertsProps {
  alerts?: AlertItem[]
  onViewAll?: () => void
}

const SENSOR_ICONS = {
  flame: Flame,
  cloud: Cloud,
  wind: Wind,
}

const SENSOR_COLORS = {
  'MQ-4': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  'MQ-7': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-800' },
  'MQ-135': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
}

const LEVEL_COLORS = {
  NORMAL: 'bg-green-100 text-green-800',
  PRECAUCION: 'bg-yellow-100 text-yellow-800',
  PELIGRO: 'bg-red-100 text-red-800',
}

export function SensorAlerts({ alerts = [], onViewAll }: SensorAlertsProps) {
  // Default alerts if none provided
  const defaultAlerts: AlertItem[] = [
    {
      id: '1',
      sensorName: 'MQ-4',
      sensorIcon: 'flame',
      level: 'PELIGRO',
      value: 850,
      timestamp: Date.now() - 5 * 60 * 1000,
      description: 'Detectado gas metano en niveles altos',
    },
    {
      id: '2',
      sensorName: 'MQ-7',
      sensorIcon: 'cloud',
      level: 'PRECAUCION',
      value: 450,
      timestamp: Date.now() - 15 * 60 * 1000,
      description: 'Monóxido de carbono elevado',
    },
  ]

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Alertas Recientes
        </h3>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-sm text-primary">
            Ver todas
          </Button>
        )}
      </div>

      <div className="px-4 space-y-2">
        {displayAlerts.map((alert) => {
          const Icon = SENSOR_ICONS[alert.sensorIcon]
          const colors = SENSOR_COLORS[alert.sensorName]
          const levelColor = LEVEL_COLORS[alert.level]
          const timeStr = new Date(alert.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <Card
              key={alert.id}
              className={`p-3 border ${colors.border} ${colors.bg}`}
            >
              <div className="flex gap-3 items-start">
                <Icon className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold text-sm ${colors.text}`}>
                        {alert.sensorName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {alert.description}
                      </p>
                    </div>
                    <Badge className={levelColor} variant="outline">
                      {alert.level === 'PELIGRO' && '🔴'}
                      {alert.level === 'PRECAUCION' && '🟡'}
                      {alert.level === 'NORMAL' && '🟢'}
                      {' '}
                      {alert.level}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={`font-semibold ${colors.text}`}>
                      {alert.value} ppm
                    </span>
                    <span className="text-muted-foreground">{timeStr}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
