package com.biosense.repository;

import java.time.LocalDateTime;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.biosense.entity.SensorDato;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface SensorDatoRepository extends ReactiveCrudRepository<SensorDato, String> {

    Mono<SensorDato> findFirstByUsuarioIdOrderByTimestampDesc(String usuarioId);

    Flux<SensorDato> findByUsuarioIdOrderByTimestampDesc(String usuarioId);

    @Query("SELECT * FROM sensor_datos WHERE usuario_id = :usuarioId AND timestamp BETWEEN :inicio AND :fin ORDER BY timestamp DESC")
    Flux<SensorDato> findByUsuarioIdAndTimestampBetween(
            @Param("usuarioId") String usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
}
