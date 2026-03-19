'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { SensorData } from '@/lib/types'
import { getApiUrl } from '@/lib/api-config'
import { useMqtt } from './use-mqtt'

const fetcher = (url: string) => fetch(url).then(res => res.json())

/**
 * Hook que maneja sensores tanto por MQTT (ESP32 real) como por API local
 * Prioridad:
 * 1. MQTT (datos en tiempo real del ESP32)
 * 2. API local (datos simulados si no hay MQTT)
 */
export function useSensorData() {
  const [useMqttData, setUseMqttData] = useState(false)
  
  // Hook MQTT para recibir datos del ESP32
  const mqtt = useMqtt()
  
  // Hook SWR para datos simulados (fallback)
  const { data: apiData, error: apiError, isLoading, mutate } = useSWR<SensorData>(
    getApiUrl('/api/sensores/latest'),
    fetcher,
    {
      refreshInterval: 2500,
      revalidateOnFocus: true,
      dedupingInterval: 1000,
      // Desactivar si estamos usando MQTT
      shouldRetryOnError: !useMqttData,
    }
  )

  // Convertir datos MQTT a formato SensorData
  const convertMqttToSensorData = (): SensorData | null => {
    if (!mqtt.sensorData) return null

    // Mapear datos MQTT al formato de la app
    return {
      mq4: mqtt.sensorData.mq4,
      mq7: mqtt.sensorData.mq7,
      mq135: mqtt.sensorData.mq135 || 0,
      nivel: mqtt.sensorData.nivel as 'NORMAL' | 'PRECAUCION' | 'PELIGRO',
      timestamp: new Date(mqtt.sensorData.timestamp).toISOString(),
    }
  }

  // Seleccionar fuente de datos
  useEffect(() => {
    if (mqtt.isConnected && mqtt.sensorData) {
      setUseMqttData(true)
    } else {
      setUseMqttData(false)
    }
  }, [mqtt.isConnected, mqtt.sensorData])

  const data = useMqttData ? convertMqttToSensorData() : apiData

  return {
    // Datos
    data,
    
    // Estados
    isLoading: useMqttData ? false : isLoading,
    isError: useMqttData ? !!mqtt.error : !!apiError,
    error: useMqttData ? mqtt.error : apiError,
    
    // Estados MQTT específicos
    mqttConnected: mqtt.isConnected,
    mqttConnecting: mqtt.isConnecting,
    mqttConnectionState: mqtt.connectionState,
    
    // Fuente actual de datos
    dataSource: useMqttData ? 'MQTT (ESP32)' : 'API (Simulado)',
    
    // Métodos
    refresh: mutate,
    publishCommand: mqtt.publish,
    disconnect: mqtt.disconnect,
  }
}
