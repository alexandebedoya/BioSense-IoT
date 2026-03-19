package com.biosense.controller;

import java.util.Collections;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.biosense.dto.AuthResponse;
import com.biosense.dto.LoginRequest;
import com.biosense.dto.RegisterRequest;
import com.biosense.dto.ResetPasswordRequest;
import com.biosense.service.AuthService;
import com.biosense.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Ampliado para soportar App Android nativa
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    @GetMapping("/success")
    public Mono<ResponseEntity<Map<String, Object>>> authSuccess(@RequestParam(value = "token", required = false) String token) {
        return Mono.fromCallable(() -> {
            log.info("[AUTH_CONTROLLER] Procesando endpoint de éxito post-login");
            Map<String, Object> response = new HashMap<>();
            
            if (token == null || token.isEmpty()) {
                log.error("[AUTH_CONTROLLER] Error: El token no fue recibido");
                response.put("success", false);
                response.put("error", "Token no recibido en el servidor");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            log.info("[AUTH_CONTROLLER] Login con Google validado, entregando JWT de BioSense");
            response.put("success", true);
            response.put("message", "Autenticación Exitosa con BioSense");
            response.put("token", token);
            return ResponseEntity.ok(response);
        });
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("[AUTH_CONTROLLER] Error en login: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(AuthResponse.builder().message(e.getMessage()).build()));
                });
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request)
                .map(response -> ResponseEntity.status(HttpStatus.CREATED).body(response))
                .onErrorResume(e -> {
                    log.error("[AUTH_CONTROLLER] Error en registro: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(AuthResponse.builder().message(e.getMessage()).build()));
                });
    }

    @PostMapping("/forgot-password")
    public Mono<ResponseEntity<Map<String, String>>> forgotPassword(@RequestBody Map<String, String> request) {
        return authService.forgotPassword(request.get("email"))
                .then(Mono.just(ResponseEntity.ok(Collections.singletonMap("message", "Email de recuperación enviado"))))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", e.getMessage()))));
    }

    @PostMapping("/reset-password")
    public Mono<ResponseEntity<Map<String, String>>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request)
                .then(Mono.just(ResponseEntity.ok(Collections.singletonMap("message", "Contraseña restablecida con éxito"))))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", e.getMessage()))));
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<String>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return authService.logout(token)
                .then(Mono.just(ResponseEntity.ok("Logout exitoso")))
                .onErrorResume(e -> {
                    log.error("[AUTH_CONTROLLER] Error en logout: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()));
                });
    }

    @GetMapping("/validate")
    public Mono<ResponseEntity<AuthResponse>> validateToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return authService.validateToken(token)
                .map(usuarioService::toDto)
                .map(dto -> ResponseEntity.ok(AuthResponse.builder().message("Token válido").usuario(dto).build()))
                .onErrorResume(e -> {
                    log.error("[AUTH_CONTROLLER] Error validando token: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(AuthResponse.builder().message(e.getMessage()).build()));
                });
    }
}
