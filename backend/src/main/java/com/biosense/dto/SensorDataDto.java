package com.biosense.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDataDto {

    @NotNull(message = "MQ-4 es requerido")
    @PositiveOrZero(message = "MQ-4 debe ser mayor o igual a 0")
    private BigDecimal mq4;

    @NotNull(message = "MQ-7 es requerido")
    @PositiveOrZero(message = "MQ-7 debe ser mayor o igual a 0")
    private BigDecimal mq7;

    @NotNull(message = "MQ-135 es requerido")
    @PositiveOrZero(message = "MQ-135 debe ser mayor o igual a 0")
    private BigDecimal mq135;

    private String nivel;
    private Integer aqi;
    private LocalDateTime timestamp;
}
