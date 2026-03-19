// ======================== LIBRERÍAS ========================
// Instala en Arduino IDE:
// Sketch > Include Library > Manage Libraries
// - PubSubClient (Nick O'Leary) - MQTT
// - ArduinoJson (Benoit Blanchon) - JSON

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ======================== CONFIGURACIÓN WiFi ========================
const char* WIFI_SSID = "Sala_sistemas";           // 📝 Cambia esto
const char* WIFI_PASSWORD = "*fKw8&97/"; // 📝 Cambia esto

// ======================== CONFIGURACIÓN MQTT ========================
const char* MQTT_SERVER = "broker.hivemq.com";   // Broker público gratis
const int MQTT_PORT = 1883;
const char* MQTT_USER = "";                      // Vacío para HiveMQ
const char* MQTT_PASSWORD = "";                  // Vacío para HiveMQ
const char* MQTT_CLIENT_ID = "ESP32_BIOSENSE_001"; // ID único del dispositivo

// ======================== TÓPICOS MQTT ========================
const char* MQTT_TOPIC_PUBLISH = "biosense-iot/sensores/datos";    // Publica sensores
const char* MQTT_TOPIC_SUBSCRIBE = "biosense-iot/control/comando"; // Recibe comandos

// ======================== PINES SENSORES (ANALÓGICO) ========================
#define MQ4_PIN 35    // Gas combustible
#define MQ7_PIN 34    // Monóxido de carbono
#define MQ135_PIN 36  // Calidad del aire (NOx, NH3, aromáticos)

// ======================== PINES LEDs (SEMÁFORO) ========================
#define LED_VERDE 26
#define LED_AMARILLO 25
#define LED_ROJO 27

// ======================== BASELINE (ajustado a tus datos) ========================
int BASE_MQ4 = 260;
int BASE_MQ7 = 220;
int BASE_MQ135 = 280;  // Valor en aire limpio

// ======================== UMBRALES (calibrados) ========================
int UMBRAL_NORMAL = 200;
int UMBRAL_PELIGRO = 800;

// ======================== VARIABLES GLOBALES ========================
int mq4 = 0;
int mq7 = 0;
int mq135 = 0;
String nivelActual = "NORMAL";
unsigned long lastMqttPublish = 0;
const unsigned long MQTT_PUBLISH_INTERVAL = 2000; // Publicar cada 2 segundos

// Objetos WiFi y MQTT
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// ======================== FUNCIÓN: CONECTAR A WiFi ========================
void conectarWiFi() {
  Serial.println("\n[WiFi] Conectando a " + String(WIFI_SSID) + "...");
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Fallo al conectar WiFi");
  }
}

// ======================== FUNCIÓN: RECONECTAR MQTT ========================
void reconectarMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Intentando conectar a " + String(MQTT_SERVER) + "...");
    
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
      Serial.println(" ✅");
      
      // Suscribirse a tópico de control
      mqttClient.subscribe(MQTT_TOPIC_SUBSCRIBE);
      Serial.println("[MQTT] Suscrito a: " + String(MQTT_TOPIC_SUBSCRIBE));
      
      // Enviar mensaje de conexión
      mqttClient.publish(MQTT_TOPIC_PUBLISH, "{\"estado\":\"conectado\"}");
      
    } else {
      Serial.print("❌ ErrorCode: ");
      Serial.println(mqttClient.state());
      delay(5000);
    }
  }
}

// ======================== FUNCIÓN: CALLBACK MQTT ========================
// Recibe mensajes del broker
void callbackMQTT(char* topic, byte* message, unsigned int length) {
  Serial.print("[MQTT] Mensaje recibido en ");
  Serial.print(topic);
  Serial.print(": ");
  
  // Convertir mensaje a string
  String msg = "";
  for (int i = 0; i < length; i++) {
    msg += (char)message[i];
  }
  Serial.println(msg);
  
  // Ejemplo: Control de LEDs desde aplicación web
  if (String(topic) == MQTT_TOPIC_SUBSCRIBE) {
    if (msg == "LED_ON") {
      digitalWrite(LED_VERDE, HIGH);
    } else if (msg == "LED_OFF") {
      digitalWrite(LED_VERDE, LOW);
    }
  }
}

// ======================== FUNCIÓN: LEER PROMEDIO (Anti-ruido) ========================
int leerPromedio(int pin) {
  int suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(pin);
    delay(5);
  }
  return suma / 10;
}

// ======================== FUNCIÓN: ACTUALIZAR SEMÁFORO ========================
void actualizarSemafo() {
  int delta_mq4 = mq4 - BASE_MQ4;
  int delta_mq7 = mq7 - BASE_MQ7;
  int delta_mq135 = mq135 - BASE_MQ135;
  
  // El nivel se determina por el peor de los 3 sensores
  int valor = max({delta_mq4, delta_mq7, delta_mq135});
  
  if (valor < UMBRAL_NORMAL) {
    digitalWrite(LED_VERDE, HIGH);
    digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_ROJO, LOW);
    nivelActual = "NORMAL";
  }
  else if (valor < UMBRAL_PELIGRO) {
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_AMARILLO, HIGH);
    digitalWrite(LED_ROJO, LOW);
    nivelActual = "MODERADO";
  }
  else {
    digitalWrite(LED_VERDE, LOW);
    digitalWrite(LED_AMARILLO, LOW);
    digitalWrite(LED_ROJO, HIGH);
    nivelActual = "PELIGRO";
  }
}

// ======================== FUNCIÓN: PUBLICAR DATOS MQTT ========================
void publicarDatos() {
  // Crear JSON con los datos de los 3 sensores
  StaticJsonDocument<512> doc;
  
  // Sensores
  doc["mq4"] = mq4;
  doc["mq7"] = mq7;
  doc["mq135"] = mq135;
  
  // Valores de referencia
  doc["base_mq4"] = BASE_MQ4;
  doc["base_mq7"] = BASE_MQ7;
  doc["base_mq135"] = BASE_MQ135;
  
  // Deltas
  doc["delta_mq4"] = mq4 - BASE_MQ4;
  doc["delta_mq7"] = mq7 - BASE_MQ7;
  doc["delta_mq135"] = mq135 - BASE_MQ135;
  
  // Nivel general
  doc["nivel"] = nivelActual;
  
  // Metadata
  doc["timestamp"] = millis();
  doc["dispositivo"] = MQTT_CLIENT_ID;
  
  // Convertir JSON a string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Publicar en MQTT
  if (mqttClient.publish(MQTT_TOPIC_PUBLISH, jsonString.c_str())) {
    Serial.println("[MQTT] Datos publicados: " + jsonString);
  } else {
    Serial.println("[MQTT] Error al publicar datos");
  }
}

// ======================== SETUP ========================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=== SISTEMA DE MONITOREO DE AIRE ===");
  Serial.println("Iniciando...\n");
  
  // Configurar pines
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(MQ4_PIN, INPUT);
  pinMode(MQ7_PIN, INPUT);
  
  // Apagar todos los LEDs inicialmente
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_ROJO, LOW);
  
  // Conectar a WiFi
  conectarWiFi();
  
  // Configurar MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(callbackMQTT);
  
  Serial.println("✅ Setup completado\n");
}

// ======================== LOOP ========================
void loop() {
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Desconectado, reconectando...");
    conectarWiFi();
  }
  
  // Verificar conexión MQTT
  if (!mqttClient.connected()) {
    reconectarMQTT();
  }
  
  // Mantener conexión MQTT activa
  mqttClient.loop();
  
  // ======================== LECTURA DE SENSORES ========================
  mq4 = leerPromedio(MQ4_PIN);
  mq7 = leerPromedio(MQ7_PIN);
  mq135 = leerPromedio(MQ135_PIN);
  
  // ======================== ACTUALIZAR SEMÁFORO ========================
  actualizarSemafo();
  
  // ======================== MOSTRAR EN SERIAL ========================
  Serial.print("[INFO] MQ4: "); Serial.print(mq4);
  Serial.print(" | MQ7: "); Serial.print(mq7);
  Serial.print(" | MQ135: "); Serial.print(mq135);
  Serial.print(" | Nivel: "); Serial.println(nivelActual);
  
  // ======================== PUBLICAR A MQTT (cada 2 segundos) ========================
  if (millis() - lastMqttPublish >= MQTT_PUBLISH_INTERVAL) {
    publicarDatos();
    lastMqttPublish = millis();
  }
  
  delay(100); // Pequeño delay para estabilidad
}
