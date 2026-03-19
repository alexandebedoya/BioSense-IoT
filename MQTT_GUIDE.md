# 🔌 MQTT - Guía de Integración Hardware + Software

Sistema de comunicación entre ESP32 (hardware) y aplicación web (frontend) usando MQTT.

---

## 📊 Arquitectura del Sistema

```
┌─────────────────┐
│   ESP32 + MQ4   │
│    MQ7 + LEDs   │ ──(WiFi MQTT)──> Broker MQTT
└─────────────────┘                      │
                                         │
                                         │
                    ┌────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Navegador Web (Next.js) │
        │  - Recibe datos en vivo  │
        │  - Muestra gráficos      │
        │  - Envía comandos        │
        └──────────────────────────┘
```

---

## 🛠 PASO 1: Configurar Arduino (ESP32)

### 1.1 Instalar Librerías en Arduino IDE

```
Sketch > Include Library > Manage Libraries

Busca e instala:
- PubSubClient (by Nick O'Leary)
- ArduinoJson (by Benoit Blanchon)
```

### 1.2 Cargar código

1. Abre el archivo: `arduino_sketch.ino` (este proyecto)
2. Edita estas líneas (⚠️ IMPORTANTE):

```cpp
// Línea ~7-8: Tu red WiFi
const char* WIFI_SSID = "TU_SSID_WIFI";           // Tu red WiFi
const char* WIFI_PASSWORD = "TU_CONTRASEÑA_WIFI"; // Tu contraseña

// Línea ~11: ID único del dispositivo
const char* MQTT_CLIENT_ID = "ESP32_BioSense IOT_001"; // Puede ser cualquier nombre
```

### 1.3 Cargar el sketch

1. Selecciona: **Tools > Board > ESP32**
2. Selecciona el puerto COM
3. Click **Upload** (flecha derecha)
4. Abre **Serial Monitor** (115200 baud) para ver logs

Deberías ver:
```
[WiFi] Conectando a tu_red_wifi...
✅ WiFi conectado!
IP: 192.168.X.X
[MQTT] Intentando conectar a broker.hivemq.com...
✅ Conectado
[INFO] MQ4: 245 | MQ7: 310 | Nivel: NORMAL
```

---

## 🌐 PASO 2: Escolher Broker MQTT

### Opción A: HiveMQ (Recomendado - Gratis, sin autenticación)

**Ventajas:**
- ✅ Gratis
- ✅ Sin autenticación
- ✅ Disponible worldwide
- ✅ Público (perfecta para testing)

**Broker:** `broker.hivemq.com` (puerto 1883)

**Ya está configurado en el código.**

---

### Opción B: Mosquitto Local (En tu PC/Raspberry Pi)

Si quieres un servidor local:

**Windows:**
```powershell
# Descargar: https://mosquitto.org/download/
# Instalar normalmente

# Iniciar broker (PowerShell como admin)
cd "C:\Program Files\mosquitto"
mosquitto -v

# Broker disponible en: localhost:1883
```

**Linux/Raspberry Pi:**
```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**Actualizar código Arduino:**
```cpp
const char* MQTT_SERVER = "localhost"; // O IP de tu servidor
const int MQTT_PORT = 1883;
```

---

### Opción C: Vercel + MQTT (Servidor remoto)

Para producción, usa un broker administrado como:
- **AWS IoT Core**
- **Azure IoT Hub**
- **HiveMQ Cloud** (https://www.hivemq.com/mqtt-cloud/)

---

## 💻 PASO 3: Configurar Aplicación Web (Next.js)

### 3.1 Actualizar configuración MQTT

Archivo: `lib/mqtt-config.ts`

```typescript
export const MQTT_CONFIG = {
  broker: 'wss://broker.hivemq.com:8884/mqtt', // WebSocket para navegador
  // O para Mosquitto local:
  // broker: 'ws://localhost:9001',
  
  topics: {
    sensores: 'BioSense IOT/sensores/datos',    // ESP32 PUBLICA aquí
    control: 'BioSense IOT/control/comando',    // App PUBLICA aquí
  },
};
```

### 3.2 Usar datos en componentes

```typescript
// Componente ejemplo
export function MiComponente() {
  const sensorData = useSensorData();
  
  return (
    <div>
      {/* Muestra si es MQTT o API fallback */}
      <p>Fuente: {sensorData.dataSource}</p>
      
      {/* Mostrar estado de conexión */}
      {sensorData.mqttConnected && (
        <span className="text-green-500">✅ Conectado al hardware</span>
      )}
      
      {/* Mostrar datos */}
      {sensorData.data && (
        <>
          <p>MQ4: {sensorData.data.mq4}</p>
          <p>MQ7: {sensorData.data.mq7}</p>
          <p>Nivel: {sensorData.data.nivel}</p>
        </>
      )}
    </div>
  );
}
```

### 3.3 Instalar dependencias

Ya lo hemos hecho:
```bash
npm install mqtt
```

---

## 📡 PASO 4: Probar la Integración

### Test 1: Verificar ESP32 se conecta

1. Abre Serial Monitor en Arduino IDE
2. Deberías ver:
```
✅ WiFi conectado!
[MQTT] Intentando conectar...
✅ Conectado
[INFO] MQ4: 245 | MQ7: 310 | Nivel: NORMAL
```

### Test 2: Verificar datos llegan a broker

**Opción A: HiveMQ Websocket Cliente**

1. Abre: https://www.hivemq.com/demos/websocket-client/
2. Conecta a: `broker.hivemq.com:8884`
3. Suscribete a: `BioSense IOT/sensores/datos`
4. Deberías ver mensajes JSON con datos cada 2 segundos

**Opción B: Con terminal (mosquitto_sub command line)**

```bash
mosquitto_sub -h broker.hivemq.com -t "BioSense IOT/sensores/datos"

# Verás algo como:
# {"mq4":245,"mq7":310,"nivel":"NORMAL","timestamp":1710705600000,"dispositivo":"ESP32_BioSense IOT_001"}
```

### Test 3: Verificar app recibe datos

1. Ejecuta la app:
```bash
npm run dev
```

2. Abre http://localhost:3000

3. Abre consola del navegador (F12)

4. Deberías ver logs:
```
[MQTT] ✅ Conectado al broker
[MQTT] Suscrito a: BioSense IOT/sensores/datos
[MQTT] Datos recibidos: {mq4: 245, mq7: 310, nivel: "NORMAL"}
```

5. Los datos aparecerán en tiempo real en la UI

---

## 🔧 Troubleshooting

### "MQTT Conectando pero nunca conecta"

**Causas comunes:**
- ❌ WiFi no está conectado (revisa Serial Monitor)
- ❌ Credenciales WiFi son incorrectas
- ❌ Firewall bloquea puerto 1883

**Solución:**
```cpp
// En Arduino, verifica:
Serial.println(WiFi.status()); // Debe ser 3 si está conectado
Serial.println(WiFi.localIP()); // Debe mostrar IP válida
```

---

### "App no recibe datos"

**Causas:**
- ❌ Broker no está disponible
- ❌ Navegador bloquea WebSocket (necesita `wss://` para HTTPS)
- ❌ Tema (topic) mal configurado

**Solución:**
```typescript
// Revisa la consola del navegador (F12)
// Deberías ver:
// [MQTT] ✅ Conectado al broker
// [MQTT] Suscrito a: BioSense IOT/sensores/datos
```

---

### "Datos antiguos o no se actualizan"

**Causa:**
- MQTT flag `retain: true` guarda último mensaje

**Solución:**
```typescript
// En mqtt-config.ts
retain: false, // Desactivar retención
```

---

## 📊 Tópicos MQTT Utilizados

| Tópico | Dirección | Contenido | Frecuencia |
|--------|-----------|-----------|-----------|
| `BioSense IOT/sensores/datos` | ESP32 → App | `{mq4, mq7, nivel, timestamp}` | Cada 2s |
| `BioSense IOT/control/comando` | App → ESP32 | `"LED_ON"` / `"LED_OFF"` | On demand |
| `BioSense IOT/conexion/estado` | Both | Estado conexión | On change |

---

## 🚀 Próximos Pasos

1. ✅ ESP32 conectado y publicando datos
2. ✅ App recibiendo datos en vivo
3. 🔜 **Control remoto**: Enviar comandos (ej: "LED_ON")
4. 🔜 **Base de datos**: Guardar histórico de datos
5. 🔜 **Alertas**: Notificaciones cuando hay peligro

---

## 📚 Referencias

- [MQTT Spec](http://mqtt.org/)
- [PubSubClient Library](https://pubsubclient.knolleary.net/)
- [HiveMQ Broker](https://www.hivemq.com/)
- [MQTT in JavaScript](https://www.mqtt.org/software)

---

**Última actualización:** 2026-03-17
