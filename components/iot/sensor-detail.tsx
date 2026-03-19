'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Cloud, Wind, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export interface SensorHistoryData {
  time: string
  value: number
}

export interface SensorDetailProps {
  sensorName: 'MQ-4' | 'MQ-7' | 'MQ-135'
  sensorLabel: string
  currentValue: number
  baseLine: number
  delta: number
  safeLimit: number
  warningLimit: number
  unit: string
  trend: number // percentage change
  historicalData: SensorHistoryData[]
}

const SENSOR_CONFIGS = {
  'MQ-4': {
    icon: Flame,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    label: 'text-orange-700',
    color: '#f97316',
    description: 'Gas metano combustible',
  },
  'MQ-7': {
    icon: Cloud,
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-900',
    label: 'text-sky-700',
    color: '#0ea5e9',
    description: 'Monóxido de carbono',
  },
  'MQ-135': {
    icon: Wind,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    label: 'text-green-700',
    color: '#22c55e',
    description: 'Calidad del aire general',
  },
}

export function SensorDetail({
  sensorName,
  sensorLabel,
  currentValue,
  baseLine,
  delta,
  safeLimit,
  warningLimit,
  unit,
  trend,
  historicalData,
}: SensorDetailProps) {
  const config = SENSOR_CONFIGS[sensorName]
  const Icon = config.icon

  // Determinar estado
  let statusColor = 'bg-green-500'
  let statusText = 'NORMAL'
  if (currentValue >= warningLimit) {
    statusColor = 'bg-orange-500'
    statusText = 'ALERTA'
  }
  if (currentValue >= safeLimit) {
    statusColor = 'bg-red-500'
    statusText = 'PELIGRO'
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className={`p-6 border-2 ${config.border} ${config.bg}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 ${config.color}`} style={{ color: config.color }} />
            <div>
              <h2 className={`text-2xl font-bold ${config.text}`}>{sensorName}</h2>
              <p className={`text-sm ${config.label}`}>{sensorLabel}</p>
            </div>
          </div>
          <Badge className={`${statusColor} text-white text-lg px-4 py-2`}>
            {statusText}
          </Badge>
        </div>

        {/* Value Display */}
        <div className="bg-white rounded-lg p-6 text-center border border-opacity-20 border-current">
          <p className={`text-5xl font-bold ${config.text}`}>{currentValue}</p>
          <p className={`text-sm ${config.label} mt-2`}>{unit}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Baseline */}
          <div className="bg-white rounded-lg p-3 border border-opacity-10 border-current">
            <p className={`text-xs ${config.label} font-semibold`}>Línea Base</p>
            <p className={`text-xl font-bold ${config.text}`}>{baseLine}</p>
          </div>

          {/* Delta */}
          <div className="bg-white rounded-lg p-3 border border-opacity-10 border-current">
            <p className={`text-xs ${config.label} font-semibold`}>Diferencia</p>
            <div className="flex items-center gap-1">
              <p className={`text-xl font-bold ${delta >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {delta >= 0 ? '+' : ''}{delta}
              </p>
              {delta >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>

          {/* Trend */}
          <div className="bg-white rounded-lg p-3 border border-opacity-10 border-current">
            <p className={`text-xs ${config.label} font-semibold`}>Tendencia</p>
            <div className="flex items-center gap-1">
              <p className={`text-xl font-bold ${trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </p>
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>

          {/* Safe Limit */}
          <div className="bg-white rounded-lg p-3 border border-opacity-10 border-current">
            <p className={`text-xs ${config.label} font-semibold`}>Límite Seguro</p>
            <p className={`text-xl font-bold ${config.text}`}>{safeLimit}</p>
          </div>
        </div>

        {/* Thresholds */}
        <div className="mt-4 pt-4 border-t border-opacity-20 border-current">
          <p className={`text-xs ${config.label} font-semibold mb-2`}>Límites de Alerta</p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{
                width: '100%',
                position: 'relative',
              }}
            >
              <div
                className="absolute top-0 bottom-0 bg-white border-2 border-gray-400 transition-all"
                style={{
                  width: '4px',
                  left: `${(warningLimit / safeLimit) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>0</span>
            <span className="font-semibold">⚠️ {warningLimit}</span>
            <span className="font-semibold">🔴 {safeLimit}</span>
          </div>
        </div>
      </Card>

      {/* Historical Chart */}
      {historicalData.length > 0 && (
        <Card className="p-4 border">
          <h3 className="font-semibold mb-4 text-sm">Histórico (Últimas 12 horas)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
