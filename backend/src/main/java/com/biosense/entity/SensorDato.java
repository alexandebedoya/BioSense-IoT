package com.biosense.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("sensor_datos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDato {

    @Id
    private String id;

    @Column("usuario_id")
    private String usuarioId;

    @Column("mq4")
    private BigDecimal mq4;

    @Column("mq7")
    private BigDecimal mq7;

    @Column("mq135")
    private BigDecimal mq135;

    @Builder.Default
    @Column("nivel")
    private AirQualityLevel nivel = AirQualityLevel.NORMAL;

    @Column("timestamp")
    private LocalDateTime timestamp;

    @Column("aqi")
    private Integer aqi;

    @CreatedDate
    @Column("created_at")
    private LocalDateTime createdAt;

    public enum AirQualityLevel {
        NORMAL, PRECAUCION, PELIGRO
    }
}
