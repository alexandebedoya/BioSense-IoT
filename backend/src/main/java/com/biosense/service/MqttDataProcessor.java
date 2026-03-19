package com.biosense.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.biosense.dto.SensorDataDto;
import com.biosense.entity.Usuario;
import com.biosense.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Procesador reactivo optimizado para flujos de datos IoT (ESP32).
 * Implementa validación, procesamiento asíncrono y detección de alertas.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MqttDataProcessor {

    private final SensorService sensorService;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    // Umbrales de alerta (MQ4/MQ7 son sensores de gases peligrosos)
    private static final BigDecimal CRITICAL_THRESHOLD = new BigDecimal("800");

    public void process(String payload) {
        Mono.fromCallable(() -> objectMapper.readTree(payload))
                .subscribeOn(Schedulers.boundedElastic()) // Mover el parsing fuera del hilo del listener MQTT
                .flatMap(this::validateAndExtractData)
                .flatMap(this::associateWithUserAndSave)
                .doOnError(e -> log.error("[MQTT_PROCESSOR] Error fatal: {}", e.getMessage()))
                .subscribe(
                    saved -> log.debug("[MQTT_PROCESSOR] Procesado finalizado con éxito"),
                    err -> {} // Ya logueado en doOnError
                );
    }

    /**
     * Valida el JSON del ESP32 y extrae los datos de sensores.
     */
    private Mono<JsonNode> validateAndExtractData(JsonNode root) {
        if (root.has("estado") && "conectado".equals(root.get("estado").asText())) {
            log.info("[MQTT] Keep-alive del dispositivo: {}", root.path("dispositivo").asText("Desconocido"));
            return Mono.empty();
        }

        if (!root.has("mq4") || !root.has("mq7") || !root.has("mq135")) {
            return Mono.error(new IllegalArgumentException("Payload incompleto: faltan lecturas de sensores"));
        }

        // Detección proactiva de alertas críticas antes de persistir
        checkCriticalLevels(root);

        return Mono.just(root);
    }

    /**
     * Busca al usuario asíncronamente y guarda la lectura de forma reactiva.
     */
    private Mono<SensorDataDto> associateWithUserAndSave(JsonNode root) {
        String dispositivoId = root.path("dispositivo").asText("ESP32_BIOSENSE_001");

        return usuarioRepository.findByNombreDispositivo(dispositivoId)
                .switchIfEmpty(Mono.defer(() -> {
                    // Fallback para desarrollo: asociar al primer usuario si el ID coincide
                    if ("ESP32_BIOSENSE_001".equals(dispositivoId)) {
                        return usuarioRepository.findAll().next();
                    }
                    return Mono.empty();
                }))
                .flatMap(usuario -> {
                    SensorDataDto dto = mapToDto(root);
                    return sensorService.saveSensorData(usuario.getId(), dto)
                            .doOnSuccess(saved -> log.info("[MQTT] Lectura persistida para usuario {} (AQI: {})", 
                                    usuario.getEmail(), saved.getAqi()));
                })
                .switchIfEmpty(Mono.fromRunnable(() -> 
                        log.warn("[MQTT] Descartando datos: Dispositivo {} no vinculado a ningún usuario activo.", dispositivoId)));
    }

    private SensorDataDto mapToDto(JsonNode root) {
        return SensorDataDto.builder()
                .mq4(new BigDecimal(root.get("mq4").asInt()))
                .mq7(new BigDecimal(root.get("mq7").asInt()))
                .mq135(new BigDecimal(root.get("mq135").asInt()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Lógica de seguridad reactiva: Identifica picos peligrosos en tiempo real.
     */
    private void checkCriticalLevels(JsonNode root) {
        BigDecimal mq4 = new BigDecimal(root.get("mq4").asInt());
        BigDecimal mq7 = new BigDecimal(root.get("mq7").asInt());

        if (mq4.compareTo(CRITICAL_THRESHOLD) > 0 || mq7.compareTo(CRITICAL_THRESHOLD) > 0) {
            log.warn("[⚠️ ALERTA CRÍTICA] Se detectaron niveles peligrosos en el dispositivo {}: MQ4={}, MQ7={}", 
                    root.path("dispositivo").asText(), mq4, mq7);
            // Aquí se podría integrar un servicio de notificaciones Push (Firebase) de forma reactiva en el futuro.
        }
    }
}
