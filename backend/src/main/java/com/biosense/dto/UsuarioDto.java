package com.biosense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDto {
    private String id;
    private String email;
    private String nombre;
    private String rol;
    private Boolean activo;
    private Boolean verificado;
    private String nombreDispositivo;
}
