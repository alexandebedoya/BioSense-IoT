'use client'

import { useEffect, useState, useRef } from 'react'
import mqtt, { MqttClient } from 'mqtt'
import { MQTT_CONFIG, MQTT_STATES } from '@/lib/mqtt-config'

interface SensorDataMQTT {
  mq4: number
  mq7: number
  mq135: number
  nivel: string
  timestamp: number
  dispositivo: string
  delta_mq4?: number
  delta_mq7?: number
  delta_mq135?: number
}

interface UseMqttReturn {
  isConnected: boolean
  isConnecting: boolean
  sensorData: SensorDataMQTT | null
  error: string | null
  connectionState: string
  publish: (message: string) => void
  disconnect: () => void
}

export function useMqtt(): UseMqttReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [sensorData, setSensorData] = useState<SensorDataMQTT | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState(MQTT_STATES.DISCONNECTED)

  const clientRef = useRef<MqttClient | null>(null)
  const reconnectCountRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // ✅ Evita doble conexión (React Strict Mode)
    if (clientRef.current) return

    const connectMQTT = async () => {
      try {
        setConnectionState(MQTT_STATES.CONNECTING)
        setIsConnecting(true)

        console.log('[MQTT] Conectando a broker:', MQTT_CONFIG.broker)

        const client = mqtt.connect(MQTT_CONFIG.broker, {
          clientId: MQTT_CONFIG.clientId,
          reconnectPeriod: MQTT_CONFIG.reconnectInterval,
          clean: true,
        })

        // ================= CONNECT =================
        client.on('connect', () => {
          console.log('[MQTT] ✅ Conectado')
          setIsConnected(true)
          setIsConnecting(false)
          setConnectionState(MQTT_STATES.CONNECTED)
          setError(null)
          reconnectCountRef.current = 0

          // ✅ LÍNEA 70 CORREGIDA
          client.subscribe(
            MQTT_CONFIG.topics.sensores,
            { qos: MQTT_CONFIG.qos },
            (err?: Error | null) => {
              if (err) {
                console.error('[MQTT] Error suscribiendo:', err.message)
                setError('Error suscribiendo a sensores')
                return
              }

              console.log('[MQTT] Suscrito a sensores')
            }
          )

          client.subscribe(MQTT_CONFIG.topics.conexion, { qos: MQTT_CONFIG.qos })
        })

        // ================= MESSAGE =================
        // ✅ LÍNEA 80 CORREGIDA
        client.on('message', (topic: string, message: Buffer) => {
          try {
            const payload = message.toString()
            if (!payload) return

            const data: unknown = JSON.parse(payload)

            // Validación mínima
            if (
              typeof data === 'object' &&
              data !== null &&
              'mq4' in data &&
              'mq7' in data &&
              'mq135' in data
            ) {
              if (topic === MQTT_CONFIG.topics.sensores) {
                setSensorData(data as SensorDataMQTT)
              }
            } else {
              console.warn('[MQTT] Payload inválido:', data)
            }

          } catch (error) {
            console.error('[MQTT] Error parseando JSON:', error)
          }
        })

        // ================= ERROR =================
        client.on('error', (err) => {
          console.error('[MQTT] Error:', err.message)
          setError(err.message || 'Error MQTT')
          setConnectionState(MQTT_STATES.ERROR)
        })

        // ================= DISCONNECT =================
        client.on('disconnect', () => {
          console.log('[MQTT] Desconectado')
          setIsConnected(false)
          setConnectionState(MQTT_STATES.DISCONNECTED)
        })

        // ================= CLOSE =================
        client.on('close', () => {
          console.log('[MQTT] Conexión cerrada')
          setIsConnected(false)
        })

        // ================= RECONNECT =================
        client.on('reconnect', () => {
          reconnectCountRef.current++
          console.log(`[MQTT] Reintentando (${reconnectCountRef.current})`)

          if (reconnectCountRef.current > MQTT_CONFIG.maxReconnectAttempts) {
            console.error('[MQTT] Máximo de reconexiones alcanzado')
            client.end(true)
            setError('No se pudo reconectar al broker')
          }
        })

        clientRef.current = client

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        console.error('[MQTT] Error inicial:', errorMsg)
        setError(errorMsg)
        setIsConnecting(false)
        setConnectionState(MQTT_STATES.ERROR)
      }
    }

    connectMQTT()

    // ================= CLEANUP =================
    // ✅ LÍNEA 157 CORREGIDA
    return () => {
      if (clientRef.current) {
        console.log('[MQTT] Cerrando conexión...')
        clientRef.current.end(true)
        clientRef.current = null
      }
    }
  }, [])

  // ================= PUBLICAR =================
  const publish = (message: string) => {
    if (!clientRef.current || !isConnected) {
      console.warn('[MQTT] No conectado')
      return
    }

    clientRef.current.publish(
      MQTT_CONFIG.topics.control,
      message,
      { qos: MQTT_CONFIG.qos },
      (err?: Error) => {
        if (err) {
          console.error('[MQTT] Error publicando:', err.message)
        } else {
          console.log('[MQTT] Mensaje enviado')
        }
      }
    )
  }

  // ================= DESCONECTAR =================
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.end(true)
      clientRef.current = null
      setIsConnected(false)
      setConnectionState(MQTT_STATES.DISCONNECTED)
    }
  }

  return {
    isConnected,
    isConnecting,
    sensorData,
    error,
    connectionState,
    publish,
    disconnect,
  }
}