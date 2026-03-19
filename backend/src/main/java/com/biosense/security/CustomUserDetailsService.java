package com.biosense.security;

import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.biosense.service.UsuarioService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements ReactiveUserDetailsService {

    private final UsuarioService usuarioService;

    @Override
    public Mono<UserDetails> findByUsername(String email) {
        return usuarioService.findByEmail(email)
                .map(usuario -> (UserDetails) usuario);
    }
}
