package com.biosense.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("sesiones_usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionUsuario {

    @Id
    private String id;

    @Column("usuario_id")
    private String usuarioId;

    @Column("token")
    private String token;

    @Column("expiracion")
    private LocalDateTime expiracion;

    @Builder.Default
    @Column("activo")
    private Boolean activo = true;

    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;
}
