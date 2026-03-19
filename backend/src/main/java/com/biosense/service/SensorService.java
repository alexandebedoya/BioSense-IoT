package com.biosense.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biosense.dto.SensorDataDto;
import com.biosense.entity.SensorDato;
import com.biosense.entity.Usuario;
import com.biosense.repository.SensorDatoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class SensorService {

    private final SensorDatoRepository sensorRepository;

    @Transactional
    public Mono<SensorDataDto> saveSensorData(String usuarioId, SensorDataDto data) {
        log.info("[SENSOR] Guardando datos de sensores para usuario: {}", usuarioId);

        Integer aqi = calculateAQI(data.getMq4(), data.getMq7(), data.getMq135());
        SensorDato.AirQualityLevel nivel = determineAirQuality(data.getMq4(), data.getMq7(), data.getMq135());

        SensorDato sensorDato = SensorDato.builder()
                .usuarioId(usuarioId)
                .mq4(data.getMq4())
                .mq7(data.getMq7())
                .mq135(data.getMq135())
                .aqi(aqi)
                .nivel(nivel)
                .timestamp(data.getTimestamp() != null ? data.getTimestamp() : LocalDateTime.now())
                .build();

        return sensorRepository.save(sensorDato)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Mono<SensorDataDto> getLatestSensorData(String usuarioId) {
        log.info("[SENSOR] Obteniendo última lectura para: {}", usuarioId);
        return sensorRepository.findFirstByUsuarioIdOrderByTimestampDesc(usuarioId)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Flux<SensorDataDto> getSensorHistory(String usuarioId) {
        log.info("[SENSOR] Obteniendo historial de sensores para: {}", usuarioId);
        return sensorRepository.findByUsuarioIdOrderByTimestampDesc(usuarioId)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Flux<SensorDataDto> getSensorDataByDateRange(String usuarioId, LocalDateTime inicio, LocalDateTime fin) {
        log.info("[SENSOR] Obteniendo datos entre {} y {} para: {}", inicio, fin, usuarioId);
        return sensorRepository.findByUsuarioIdAndTimestampBetween(usuarioId, inicio, fin)
                .map(this::toDto);
    }

    private Integer calculateAQI(BigDecimal mq4, BigDecimal mq7, BigDecimal mq135) {
        // Fórmula AQI simplificada
        BigDecimal aqi = (mq4.divide(BigDecimal.valueOf(50), 2, java.math.RoundingMode.HALF_UP)
                .add(mq7.divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP))
                .add(mq135.divide(BigDecimal.valueOf(75), 2, java.math.RoundingMode.HALF_UP)))
                .multiply(BigDecimal.valueOf(50));

        return aqi.intValue();
    }

    private SensorDato.AirQualityLevel determineAirQuality(BigDecimal mq4, BigDecimal mq7, BigDecimal mq135) {
        // Umbrales de calidad del aire
        if (mq4.compareTo(BigDecimal.valueOf(500)) > 0 ||
                mq7.compareTo(BigDecimal.valueOf(400)) > 0 ||
                mq135.compareTo(BigDecimal.valueOf(600)) > 0) {
            return SensorDato.AirQualityLevel.PELIGRO;
        }

        if (mq4.compareTo(BigDecimal.valueOf(300)) > 0 ||
                mq7.compareTo(BigDecimal.valueOf(200)) > 0 ||
                mq135.compareTo(BigDecimal.valueOf(350)) > 0) {
            return SensorDato.AirQualityLevel.PRECAUCION;
        }

        return SensorDato.AirQualityLevel.NORMAL;
    }

    public SensorDataDto toDto(SensorDato sensorDato) {
        return SensorDataDto.builder()
                .mq4(sensorDato.getMq4())
                .mq7(sensorDato.getMq7())
                .mq135(sensorDato.getMq135())
                .nivel(sensorDato.getNivel().toString())
                .aqi(sensorDato.getAqi())
                .timestamp(sensorDato.getTimestamp())
                .build();
    }
}
