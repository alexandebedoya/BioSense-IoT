package com.biosense.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.biosense.dto.AuthResponse;
import com.biosense.dto.LoginRequest;
import com.biosense.dto.RegisterRequest;
import com.biosense.dto.ResetPasswordRequest;
import com.biosense.entity.SesionUsuario;
import com.biosense.entity.Usuario;
import com.biosense.repository.SesionUsuarioRepository;
import com.biosense.repository.UsuarioRepository;
import com.biosense.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioService usuarioService;
    private final SesionUsuarioRepository sesionRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Mono<Void> forgotPassword(String email) {
        log.info("[AUTH] Forgot password request for: {}", email);
        return usuarioRepository.findByEmail(email)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado con ese email")))
                .flatMap(usuario -> {
                    String resetToken = UUID.randomUUID().toString();
                    usuario.setResetToken(resetToken);
                    usuario.setResetTokenExpiration(LocalDateTime.now().plusHours(1));
                    return usuarioRepository.save(usuario)
                            .then(Mono.fromRunnable(() -> {
                                try {
                                    SimpleMailMessage message = new SimpleMailMessage();
                                    message.setTo(email);
                                    message.setSubject("BioSense IOT - Recuperación de contraseña");
                                    message.setText("Usa este token para restablecer tu contraseña: " + resetToken +
                                            "\nExpira en 1 hora.");
                                    mailSender.send(message);
                                    log.info("[AUTH] Email de recuperación enviado a: {}", email);
                                } catch (Exception e) {
                                    log.error("[AUTH] Error al enviar email: {}", e.getMessage());
                                    throw new RuntimeException("No se pudo enviar el email de recuperación");
                                }
                            }).subscribeOn(Schedulers.boundedElastic()));
                }).then();
    }

    @Transactional
    public Mono<Void> resetPassword(ResetPasswordRequest request) {
        log.info("[AUTH] Reset password attempt");

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return Mono.error(new RuntimeException("Las contraseñas no coinciden"));
        }

        return usuarioRepository.findByResetToken(request.getToken())
                .switchIfEmpty(Mono.error(new RuntimeException("Token de recuperación inválido")))
                .flatMap(usuario -> {
                    if (usuario.getResetTokenExpiration().isBefore(LocalDateTime.now())) {
                        return Mono.error(new RuntimeException("El token de recuperación ha expirado"));
                    }

                    usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    usuario.setResetToken(null);
                    usuario.setResetTokenExpiration(null);
                    return usuarioRepository.save(usuario);
                })
                .doOnSuccess(u -> log.info("[AUTH] ✓ Contraseña restablecida con éxito"))
                .then();
    }

    @Transactional
    public Mono<AuthResponse> login(LoginRequest request) {
        log.info("[AUTH] Login intent: {}", request.getEmail());

        return usuarioService.findByEmail(request.getEmail())
                .flatMap(usuario -> {
                    if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                        log.warn("[AUTH] Login failed for: {}", request.getEmail());
                        return Mono.error(new RuntimeException("Email o contraseña inválidos"));
                    }

                    if (!usuario.getActivo()) {
                        log.warn("[AUTH] Login attempt for inactive user: {}", request.getEmail());
                        return Mono.error(new RuntimeException("Usuario inactivo"));
                    }

                    String token = jwtTokenProvider.generateToken(usuario);

                    SesionUsuario sesion = SesionUsuario.builder()
                            .usuarioId(usuario.getId())
                            .token(token)
                            .expiracion(LocalDateTime.now().plusDays(7))
                            .activo(true)
                            .build();

                    return sesionRepository.save(sesion)
                            .map(savedSesion -> {
                                log.info("[AUTH] ✓ Login exitoso para: {}", request.getEmail());
                                return AuthResponse.builder()
                                        .token(token)
                                        .usuario(usuarioService.toDto(usuario))
                                        .message("Login exitoso")
                                        .build();
                            });
                })
                .switchIfEmpty(Mono.error(new RuntimeException("Email o contraseña inválidos")));
    }

    @Transactional
    public Mono<AuthResponse> register(RegisterRequest request) {
        log.info("[AUTH] Registro intent: {}", request.getEmail());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return Mono.error(new RuntimeException("Las contraseñas no coinciden"));
        }

        if (request.getPassword().length() < 8) {
            return Mono.error(new RuntimeException("La contraseña debe tener mínimo 8 caracteres"));
        }

        return usuarioService.existsByEmail(request.getEmail())
                .flatMap(exists -> {
                    if (exists) {
                        log.warn("[AUTH] Email ya existe: {}", request.getEmail());
                        return Mono.error(new RuntimeException("El email ya está registrado"));
                    }

                    return usuarioService.createUsuario(
                            request.getEmail(),
                            request.getNombre(),
                            request.getPassword(),
                            request.getNombreDispositivo())
                            .flatMap(usuario -> {
                                String token = jwtTokenProvider.generateToken(usuario);

                                SesionUsuario sesion = SesionUsuario.builder()
                                        .usuarioId(usuario.getId())
                                        .token(token)
                                        .expiracion(LocalDateTime.now().plusDays(7))
                                        .activo(true)
                                        .build();

                                return sesionRepository.save(sesion)
                                        .map(savedSesion -> {
                                            log.info("[AUTH] ✓ Registro exitoso para: {}", request.getEmail());
                                            return AuthResponse.builder()
                                                    .token(token)
                                                    .usuario(usuarioService.toDto(usuario))
                                                    .message("Registro exitoso")
                                                    .build();
                                        });
                            });
                });
    }

    @Transactional
    public Mono<Void> logout(String token) {
        log.info("[AUTH] Logout");
        return sesionRepository.findByToken(token)
                .flatMap(sesion -> {
                    sesion.setActivo(false);
                    return sesionRepository.save(sesion);
                })
                .then();
    }

    public Mono<Usuario> validateToken(String token) {
        if (!jwtTokenProvider.isTokenValid(token)) {
            return Mono.error(new RuntimeException("Token inválido o expirado"));
        }

        return sesionRepository.findByToken(token)
                .switchIfEmpty(Mono.error(new RuntimeException("Sesión no encontrada")))
                .flatMap(sesion -> {
                    if (!sesion.getActivo() || sesion.getExpiracion().isBefore(LocalDateTime.now())) {
                        return Mono.error(new RuntimeException("Sesión expirada"));
                    }
                    return usuarioRepository.findById(sesion.getUsuarioId());
                });
    }
}
