package com.biosense.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biosense.dto.SensorDataDto;
import com.biosense.entity.Usuario;
import com.biosense.service.SensorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/sensores")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class SensorController {

    private final SensorService sensorService;

    @PostMapping("/data")
    public Mono<ResponseEntity<SensorDataDto>> saveSensorData(
            @Valid @RequestBody SensorDataDto data,
            Authentication authentication) {
        return Mono.justOrEmpty(authentication)
                .map(auth -> (Usuario) auth.getPrincipal())
                .flatMap(usuario -> sensorService.saveSensorData(usuario.getId(), data))
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved))
                .onErrorResume(e -> {
                    log.error("[SENSOR_CONTROLLER] Error guardando datos: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
                });
    }

    @GetMapping("/latest")
    public Mono<ResponseEntity<SensorDataDto>> getLatestSensorData(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }
        
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return sensorService.getLatestSensorData(usuario.getId())
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build())
                .onErrorResume(e -> {
                    log.error("[SENSOR_CONTROLLER] Error obteniendo datos: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
                });
    }

    @GetMapping("/history")
    public Flux<SensorDataDto> getSensorHistory(Authentication authentication) {
        return Mono.justOrEmpty(authentication)
                .map(auth -> (Usuario) auth.getPrincipal())
                .flatMapMany(usuario -> sensorService.getSensorHistory(usuario.getId()))
                .onErrorResume(e -> {
                    log.error("[SENSOR_CONTROLLER] Error obteniendo historial: {}", e.getMessage());
                    return Flux.empty();
                });
    }

    @GetMapping("/range")
    public Flux<SensorDataDto> getSensorDataByRange(
            @RequestParam String inicio,
            @RequestParam String fin,
            Authentication authentication) {
        return Mono.justOrEmpty(authentication)
                .map(auth -> (Usuario) auth.getPrincipal())
                .flatMapMany(usuario -> {
                    DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
                    LocalDateTime inicioDateTime = LocalDateTime.parse(inicio, formatter);
                    LocalDateTime finDateTime = LocalDateTime.parse(fin, formatter);
                    return sensorService.getSensorDataByDateRange(usuario.getId(), inicioDateTime, finDateTime);
                })
                .onErrorResume(e -> {
                    log.error("[SENSOR_CONTROLLER] Error obteniendo datos por rango: {}", e.getMessage());
                    return Flux.empty();
                });
    }
}
