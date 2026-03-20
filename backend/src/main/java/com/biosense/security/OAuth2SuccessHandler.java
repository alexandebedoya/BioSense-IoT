package com.biosense.security;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.biosense.service.UsuarioService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements ServerAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UsuarioService usuarioService;

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture = oAuth2User.getAttribute("picture");

        log.info("[OAUTH2] Login exitoso con Google: {}. Procesando persistencia...", email);

        return usuarioService.processOAuthPostLogin(email, name, googleId, picture)
                .flatMap(usuario -> {
                    String token = tokenProvider.generateToken(usuario);
                    log.info("[AUTH_DEBUG] JWT GENERADO: {}", token);

                    // Detectar si venimos de la App móvil usando el parámetro 'state'
                    String state = webFilterExchange.getExchange().getRequest().getQueryParams().getFirst("state");
                    boolean isMobile = "mobile".equals(state);
                    
                    // URL base del frontend en producción
                    String frontendUrl = "https://biosense-iot-production.up.railway.app";
                    String targetUrl = frontendUrl + "/oauth/callback?token=" + token;

                    // Si es móvil, usamos el esquema de la App (com.biosense.iot)
                    if (isMobile) {
                        log.info("[OAUTH2] Login desde móvil detectado (state=mobile). Usando Deep Link.");
                        targetUrl = "com.biosense.iot://oauth/callback?token=" + token;
                    }

                    log.info("[OAUTH2] Redirigiendo a: {}", targetUrl);

                    ServerHttpResponse response = webFilterExchange.getExchange().getResponse();
                    response.setStatusCode(HttpStatus.FOUND);
                    response.getHeaders().setLocation(URI.create(targetUrl));
                    return response.setComplete();
                });
    }
}
