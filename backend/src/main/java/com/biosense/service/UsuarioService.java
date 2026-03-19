package com.biosense.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biosense.dto.UsuarioDto;
import com.biosense.entity.Usuario;
import com.biosense.exception.DatabaseConflictException;
import com.biosense.repository.UsuarioRepository;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Autowired
    public void setPasswordEncoder(@Lazy PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Mono<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public Mono<Usuario> findById(String id) {
        return usuarioRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Mono<Boolean> existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    /**
     * Procesa el login de OAuth2. Busca al usuario por email:
     * - Si existe: actualiza googleId y fotoUrl si son nulos o han cambiado.
     * - Si no existe: lo crea.
     */
    @Transactional
    public Mono<Usuario> processOAuthPostLogin(String email, String nombre, String googleId, String fotoUrl) {
        log.info("[USUARIO] Procesando post-login OAuth2 para: {}", email);

        return usuarioRepository.findByEmail(email)
                .flatMap(usuario -> {
                    log.debug("[USUARIO] Usuario existente encontrado, actualizando datos de Google");
                    boolean modified = false;
                    if (usuario.getGoogleId() == null) {
                        usuario.setGoogleId(googleId);
                        modified = true;
                    }
                    if (fotoUrl != null && !fotoUrl.equals(usuario.getFotoUrl())) {
                        usuario.setFotoUrl(fotoUrl);
                        modified = true;
                    }
                    return modified ? usuarioRepository.save(usuario) : Mono.just(usuario);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.info("[USUARIO] Usuario no encontrado, creando nueva cuenta de Google para: {}", email);
                    Usuario nuevoUsuario = Usuario.builder()
                            .email(email)
                            .nombre(nombre != null ? nombre : email.split("@")[0])
                            .googleId(googleId)
                            .fotoUrl(fotoUrl)
                            .password(passwordEncoder.encode("OAUTH2_USER_" + System.nanoTime()))
                            .rol("USER")
                            .activo(true)
                            .verificado(true)
                            .build();
                    return usuarioRepository.save(nuevoUsuario)
                            .onErrorMap(e -> {
                                log.error("[USUARIO] Error al guardar nuevo usuario de Google: {}", e.getMessage());
                                return new DatabaseConflictException(
                                        "No se pudo crear el usuario debido a un conflicto en la base de datos.");
                            });
                }));
    }

    @Transactional
    public Mono<Usuario> createUsuario(String email, String nombre, String password, String nombreDispositivo) {
        return usuarioRepository.existsByEmail(email)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new DatabaseConflictException("El email ya está registrado."));
                    }

                    Usuario usuario = Usuario.builder()
                            .email(email)
                            .nombre(nombre)
                            .password(passwordEncoder.encode(password))
                            .nombreDispositivo(nombreDispositivo)
                            .rol("USER")
                            .activo(true)
                            .verificado(false)
                            .build();

                    return usuarioRepository.save(usuario);
                });
    }

    public UsuarioDto toDto(Usuario usuario) {
        if (usuario == null)
            return null;

        UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setEmail(usuario.getEmail());
        dto.setNombre(usuario.getNombre());
        dto.setRol(usuario.getRol());
        dto.setActivo(usuario.getActivo());
        dto.setVerificado(usuario.getVerificado());
        dto.setNombreDispositivo(usuario.getNombreDispositivo());

        return dto;
    }
}
