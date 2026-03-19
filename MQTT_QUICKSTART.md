# ⚡ INICIO RÁPIDO: Hardware + Software (MQTT)

**Objetivo:** Conectar ESP32 con sensores a la app web en tiempo real.

---

## 🚀 PASO 1: Arduino (5 minutos)

1. **Abre Arduino IDE**
2. **Instala librerías:**
   ```
   Sketch > Include Library > Manage Libraries
   - PubSubClient
   - ArduinoJson
   ```

3. **Edita código:**
   - Abre: `arduino_sketch.ino`
   - Línea 7: `WIFI_SSID = "Sala_sistemas"`
   - Línea 8: `WIFI_PASSWORD = "*fKw8&97/"`
   - Line 11: `MQTT_CLIENT_ID = "ESP32_BioSense IOT"` (cualquier nombre)

4. **Carga en ESP32:**
   - Tools > Board > ESP32
   - Tools > Port > COM[X]
   - Upload

5. **Verifica Serial Monitor (115200):**
   ```
   ✅ WiFi conectado!
   [MQTT] ✅ Conectado
   [INFO] MQ4: 245 | MQ7: 310 | Nivel: NORMAL
   ```

✅ **¡Arduino está listo!**

---

## 💻 PASO 2: Aplicación Web (5 minutos)

### 2.1 Instalar dependencias

```bash
cd c:\Users\alexi\Desktop\BioSense IOT1
npm install mqtt
```

### 2.2 Ejecutar en desarrollo

```bash
npm run dev
```

Abre: http://localhost:3000

### 2.3 Verificar conexión MQTT

Abre consola (F12) y busca logs:
```
[MQTT] ✅ Conectado al broker
[MQTT] Suscrito a: BioSense IOT/sensores/datos
[MQTT] Datos recibidos: {mq4: 245, mq7: 310...}
```

✅ **¡App conectada!**

---

## 🧪 PASO 3: Prueba Integración (5 minutos)

### Opción A: Dashboard de Datos

1. Navega a componente que use `useSensorData()`
2. Deberías ver:
   - ✅ "Fuente: MQTT (ESP32)"
   - ✅ Datos actualizados cada 2 segundos
   - ✅ Semáforo con colores correctos

### Opción B: Test Directo

1. Copia este componente en tu página:
```tsx
import { MqttTestComponent } from '@/components/iot/mqtt-test'

export default function TestPage() {
  return <MqttTestComponent />
}
```

2. Navega a esa página
3. Verifica que muestre datos en vivo

### Opción C: Monitor MQTT web

1. Abre: https://www.hivemq.com/demos/websocket-client/
2. Conecta a: `broker.hivemq.com:8884`
3. Suscribete a: `BioSense IOT/sensores/datos`
4. Deberías ver mensajes JSON cada 2 segundos

---

## 🔧 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| ❌ Arduino no conecta WiFi | Revisa SSID y password en línea 7-8 |
| ❌ Arduino conecta pero no MQTT | Verifica broker `broker.hivemq.com:1883` |
| ❌ App no recibe datos | Abre F12, busca logs `[MQTT]` |
| ❌ Browser bloquea WebSocket | Necesitas `wss://` para HTTPS (config ya lista) |
| ❌ Datos no se actualizan | Recarga la página (F5) |

---

## 📊 Archivos Creados/Modificados

```
✅ arduino_sketch.ino          - Código ESP32 con WiFi + MQTT
✅ lib/mqtt-config.ts          - Configuración broker
✅ hooks/use-mqtt.ts           - Hook para conectar MQTT
✅ hooks/use-sensor-data.ts    - Hook híbrido (MQTT + API)
✅ components/iot/mqtt-test.tsx - Componente de prueba
✅ MQTT_GUIDE.md               - Guía completa
```

---

## 🌐 Brokers Recomendados

### Desarrollo (ahora mismo)
- **HiveMQ** ← Recomendado
  - URL: `broker.hivemq.com:1883`
  - Gratis, sin autenticación
  - Público (testing)

### Local (Opcional)
- **Mosquitto**
  - Descargar: https://mosquitto.org/download/
  - URL: `localhost:1883`
  - Control total

### Producción
- **AWS IoT Core**
- **Azure IoT Hub**
- **HiveMQ Cloud**

---

## 📈 Próximo: Enviar Comandos

Una vez funcionando, puedes controlar LEDs desde la app:

```tsx
const { publishCommand } = useSensorData()

// Enviar comando al ESP32
publishCommand('LED_ON')   // Enciende LED
publishCommand('LED_OFF')  // Apaga LED
```

---

## 🎯 Resumen Flujo

```
1. ESP32 lee sensores MQ4/MQ7 cada 500ms
   ↓
2. Conecta a WiFi ("TU_RED_WIFI")
   ↓
3. Se conecta a broker MQTT (broker.hivemq.com)
   ↓
4. Publica JSON en: BioSense IOT/sensores/datos
   ↓
5. App web (Next.js) se suscribe al tópico
   ↓
6. Recibe datos en tiempo real
   ↓
7. Muestra semáforo + gráficos
   ↓
8. Usuario puede enviar comandos (LED ON/OFF)
   ↓
9. ESP32 recibe comandos en: BioSense IOT/control/comando
```

---

## ✅ Checklist

- [ ] Arduino Sketch cargado en ESP32
- [ ] ESP32 conectado a Red WiFi
- [ ] Serial Monitor muestra "✅ Conectado"
- [ ] `npm install mqtt` ejecutado
- [ ] `npm run dev` ejecutándose
- [ ] App muestra "Fuente: MQTT (ESP32)"
- [ ] Datos se actualizan en vivo
- [ ] Semáforo cambia según nivel

---

**¡Sistema operacional! 🎉**

Para más detalles, ver: `MQTT_GUIDE.md`
