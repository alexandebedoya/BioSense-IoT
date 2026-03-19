'use client'

import { useSensorData } from '@/hooks/use-sensor-data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'

/**
 * Componente de prueba para verificar integración MQTT
 * Muestra:
 * - Estado de conexión MQTT
 * - Datos en tiempo real del ESP32
 * - Fuente de datos (MQTT vs API simulada)
 */
export function MqttTestComponent() {
  const {
    data,
    isLoading,
    isError,
    error,
    mqttConnected,
    mqttConnecting,
    mqttConnectionState,
    dataSource,
  } = useSensorData()

  return (
    <div className="w-full max-w-md space-y-4">
      {/* HEADER: Estado de conexión */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Estado MQTT</h3>
          <div className="flex items-center gap-2">
            {mqttConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <Badge className="bg-green-500">Conectado</Badge>
              </>
            ) : mqttConnecting ? (
              <>
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                <Badge className="bg-yellow-500">Conectando...</Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <Badge className="bg-red-500">Desconectado</Badge>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold">Estado:</span> {mqttConnectionState}
          </div>
          <div>
            <span className="font-semibold">Fuente de datos:</span> {dataSource}
          </div>
        </div>
      </Card>

      {/* ERROR STATE */}
      {isError && error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* LOADING STATE */}
      {isLoading && !data && (
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Esperando datos...</p>
          </div>
        </Card>
      )}

      {/* SENSOR DATA */}
      {data && (
        <>
          {/* MQ4 */}
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">MQ4</p>
                <p className="text-2xl font-bold">{data.mq4}</p>
                <p className="text-xs text-muted-foreground">Gas combustible</p>
              </div>
              <Badge className="bg-blue-100 text-blue-900">{data.mq4}</Badge>
            </div>
          </Card>

          {/* MQ7 */}
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">MQ7</p>
                <p className="text-2xl font-bold">{data.mq7}</p>
                <p className="text-xs text-muted-foreground">Monóxido de carbono</p>
              </div>
              <Badge className="bg-orange-100 text-orange-900">{data.mq7}</Badge>
            </div>
          </Card>

          {/* NIVEL */}
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Nivel de Alerta</p>
                <p className="text-2xl font-bold">{data.nivel}</p>
              </div>
              <div>
                {data.nivel === 'NORMAL' && (
                  <Badge className="bg-green-500">🟢 Normal</Badge>
                )}
                {data.nivel === 'MODERADO' && (
                  <Badge className="bg-yellow-500">🟡 Moderado</Badge>
                )}
                {data.nivel === 'PELIGRO' && (
                  <Badge className="bg-red-500">🔴 Peligro</Badge>
                )}
              </div>
            </div>
          </Card>

          {/* TIMESTAMP */}
          <Card className="p-4 bg-muted">
            <p className="text-xs text-muted-foreground">Última actualización</p>
            <p className="text-sm font-mono">
              {new Date(data.timestamp).toLocaleTimeString('es-ES')}
            </p>
          </Card>
        </>
      )}

      {/* INFO BOX */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm space-y-2">
          <p className="font-semibold text-blue-900">💡 Información</p>
          <ul className="text-blue-800 text-xs space-y-1">
            <li>✓ Si ves "Conectado": ESP32 está publicando datos</li>
            <li>✓ Fuente MQTT: Datos en vivo del hardware</li>
            <li>✓ Fuente API: Datos simulados (fallback)</li>
            <li>✓ Los datos se actualizan cada 2 segundos</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
