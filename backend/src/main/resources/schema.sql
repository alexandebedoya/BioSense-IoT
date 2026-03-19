CREATE TABLE IF NOT EXISTS usuario (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'USER',
    google_id VARCHAR(255) UNIQUE,
    foto_url VARCHAR(1024),
    nombre_dispositivo VARCHAR(255), -- Cambiado a snake_case
    reset_token VARCHAR(255),
    reset_token_expiration TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cambiado a snake_case
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Cambiado a snake_case
);

CREATE TABLE IF NOT EXISTS sensor_datos (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) NOT NULL,
    mq4 DECIMAL(10,2) NOT NULL,
    mq7 DECIMAL(10,2) NOT NULL,
    mq135 DECIMAL(10,2) NOT NULL,
    nivel VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
    timestamp TIMESTAMP NOT NULL,
    aqi INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_datos FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sesiones_usuario (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id VARCHAR(255) NOT NULL,
    token TEXT NOT NULL,
    expiracion TIMESTAMP NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_sesion FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);