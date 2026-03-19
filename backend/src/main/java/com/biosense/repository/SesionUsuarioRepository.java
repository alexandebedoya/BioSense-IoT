package com.biosense.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.biosense.entity.SesionUsuario;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface SesionUsuarioRepository extends ReactiveCrudRepository<SesionUsuario, String> {
    Mono<SesionUsuario> findByToken(String token);

    Flux<SesionUsuario> findByUsuarioIdAndActivo(String usuarioId, Boolean activo);

    Mono<Void> deleteByUsuarioId(String usuarioId);
}
