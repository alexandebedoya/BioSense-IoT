/**
 * Configuración MQTT para la aplicación
 * El ESP32 publica datos aquí, la app los recibe
 */

export const MQTT_CONFIG = {
  // Broker público gratuito (sin autenticación)
  broker: 'wss://broker.hivemq.com:8884/mqtt',
  
  // O usa Mosquitto (si tienes un servidor local):
  // broker: 'ws://localhost:9001',
  
  // Configuración del cliente
  clientId: `web-client-${Math.random().toString(36).substr(2, 9)}`,
  
  // Tópicos (deben coincidir con Arduino)
  topics: {
    sensores: 'BioSense IOT/sensores/datos',        // Recibe datos del ESP32 (todos los sensores)
    mq4: 'BioSense IOT/sensores/mq4',               // Datos individuales MQ4 (opcional)
    mq7: 'BioSense IOT/sensores/mq7',               // Datos individuales MQ7 (opcional)
    mq135: 'BioSense IOT/sensores/mq135',           // Datos individuales MQ135 (opcional)
    control: 'BioSense IOT/control/comando',        // Envía comandos al ESP32
    conexion: 'BioSense IOT/conexion/estado',       // Estado de conexión
  },
  
  // Opciones MQTT
  qos: 1,
  retain: true,
  
  // Reintentos
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
};

/**
 * Estados de conexión MQTT
 */
export const MQTT_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTING: 'disconnecting',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
};
