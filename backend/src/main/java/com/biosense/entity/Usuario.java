package com.biosense.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Table("usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    private String id;

    @Column("email")
    private String email;

    @Column("nombre")
    private String nombre;

    @Column("password")
    private String password;

    @Builder.Default
    @Column("rol")
    private String rol = "USER";

    @Column("google_id")
    private String googleId;

    @Column("foto_url")
    private String fotoUrl;

    @Column("nombreDispositivo")
    private String nombreDispositivo;

    @Column("reset_token")
    private String resetToken;

    @Column("reset_token_expiration")
    private LocalDateTime resetTokenExpiration;

    @Builder.Default
    @Column("activo")
    private Boolean activo = true;

    @Builder.Default
    @Column("verificado")
    private Boolean verificado = false;

    @CreatedDate
    @Column("creadoEn")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column("actualizadoEn")
    private LocalDateTime updatedAt;

    // --- Métodos de UserDetails ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return activo != null && activo;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo != null && activo;
    }
}
