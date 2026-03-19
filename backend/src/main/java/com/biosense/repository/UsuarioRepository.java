package com.biosense.repository;

import com.biosense.entity.Usuario;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface UsuarioRepository extends ReactiveCrudRepository<Usuario, String> {
    Mono<Usuario> findByEmail(String email);

    Mono<Usuario> findByGoogleId(String googleId);

    Mono<Usuario> findByNombreDispositivo(String nombreDispositivo);

    Mono<Usuario> findByResetToken(String resetToken);

    Mono<Boolean> existsByEmail(String email);
}
