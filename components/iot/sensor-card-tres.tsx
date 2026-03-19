'use client'

import { useSensorData } from '@/hooks/use-sensor-data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Flame, Cloud, Wind, Gauge } from 'lucide-react'

/**
 * Componente que muestra los 3 sensores: MQ4, MQ7, MQ135
 */
export function SensorCardTres() {
  const { data, isLoading, dataSource } = useSensorData()

  if (isLoading) {
    return (
      <Card className="p-8 border-dashed">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Cargando sensores...</p>
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">Error cargando sensores</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Sensores de Aire</h2>
        <Badge variant="outline" className="text-xs">
          {dataSource}
        </Badge>
      </div>

      {/* Grid 3 Sensores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MQ4 - Gas Combustible */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-sm text-orange-900">MQ-4</span>
              </div>
              <Badge className="bg-orange-500 text-white">Gas</Badge>
            </div>

            <div>
              <p className="text-xs text-orange-700 mb-1">Metano (CH₄)</p>
              <p className="text-3xl font-bold text-orange-900">{data.mq4}</p>
              <p className="text-xs text-orange-600 mt-1">ppm</p>
            </div>

            <div className="pt-2 border-t border-orange-200">
              <p className="text-xs text-orange-700">Límite seguro: 300</p>
            </div>
          </div>
        </Card>

        {/* MQ7 - Monóxido de Carbono */}
        <Card className="p-4 bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-600" />
                <span className="font-semibold text-sm text-sky-900">MQ-7</span>
              </div>
              <Badge className="bg-sky-500 text-white">CO</Badge>
            </div>

            <div>
              <p className="text-xs text-sky-700 mb-1">Monóxido de Carbono</p>
              <p className="text-3xl font-bold text-sky-900">{data.mq7}</p>
              <p className="text-xs text-sky-600 mt-1">ppm</p>
            </div>

            <div className="pt-2 border-t border-sky-200">
              <p className="text-xs text-sky-700">Límite seguro: 200</p>
            </div>
          </div>
        </Card>

        {/* MQ135 - Calidad del Aire */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-sm text-green-900">MQ-135</span>
              </div>
              <Badge className="bg-green-500 text-white">Aire</Badge>
            </div>

            <div>
              <p className="text-xs text-green-700 mb-1">Calidad del Aire</p>
              <p className="text-3xl font-bold text-green-900">{data.mq135}</p>
              <p className="text-xs text-green-600 mt-1">ppm</p>
            </div>

            <div className="pt-2 border-t border-green-200">
              <p className="text-xs text-green-700">Límite seguro: 350</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Nivel General */}
      <Card className="p-4 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Nivel General</p>
              <p className="text-xs text-slate-600">Estado de la calidad del aire</p>
            </div>
          </div>

          <div>
            {data.nivel === 'NORMAL' && (
              <Badge className="bg-green-500 text-lg px-4 py-1">🟢 NORMAL</Badge>
            )}
            {data.nivel === 'PRECAUCION' && (
              <Badge className="bg-yellow-500 text-lg px-4 py-1">🟡 PRECAUCIÓN</Badge>
            )}
            {data.nivel === 'PELIGRO' && (
              <Badge className="bg-red-500 text-lg px-4 py-1">🔴 PELIGRO</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground text-center pt-2">
        Última actualización: {new Date(data.timestamp).toLocaleTimeString('es-ES')}
      </div>
    </div>
  )
}
