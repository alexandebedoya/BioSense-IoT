-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "nombreDispositivo" VARCHAR(255),
    "ubicacion" VARCHAR(255),
    "telefono" VARCHAR(20),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "ultimoLogin" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "dispositivo" VARCHAR(255),
    "direccionIP" VARCHAR(45),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradoEn" TIMESTAMP(3),

    CONSTRAINT "SesionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorConfig" (
    "id" TEXT NOT NULL,
    "codigoMQ4" TEXT NOT NULL DEFAULT 'MQ4_DEFAULT',
    "codigoMQ7" TEXT NOT NULL DEFAULT 'MQ7_DEFAULT',
    "codigoMQ135" TEXT NOT NULL DEFAULT 'MQ135_DEFAULT',
    "usuarioId" TEXT NOT NULL,
    "baseMQ4" INTEGER NOT NULL DEFAULT 260,
    "baseMQ7" INTEGER NOT NULL DEFAULT 220,
    "baseMQ135" INTEGER NOT NULL DEFAULT 280,
    "umbralNormal" INTEGER NOT NULL DEFAULT 200,
    "umbralPeligro" INTEGER NOT NULL DEFAULT 800,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "nombre" VARCHAR(255) NOT NULL,
    "ubicacion" VARCHAR(255),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturaSensor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "configuracionId" TEXT NOT NULL,
    "mq4" INTEGER NOT NULL,
    "mq7" INTEGER NOT NULL,
    "mq135" INTEGER NOT NULL,
    "deltaMQ4" INTEGER NOT NULL,
    "deltaMQ7" INTEGER NOT NULL,
    "deltaMQ135" INTEGER NOT NULL,
    "valorPromedio" INTEGER NOT NULL,
    "nivel" CHAR(10) NOT NULL,
    "temperatura" DOUBLE PRECISION,
    "humedad" DOUBLE PRECISION,
    "presion" DOUBLE PRECISION,
    "lecturaMQTT" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LecturaSensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "configuracionId" TEXT NOT NULL,
    "nivel" CHAR(10) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "procesada" BOOLEAN NOT NULL DEFAULT false,
    "notificacion" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leidaEn" TIMESTAMP(3),
    "procesadaEn" TIMESTAMP(3),

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(50) NOT NULL,
    "entidadId" VARCHAR(50),
    "cambios" TEXT,
    "direccionIP" VARCHAR(45),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreferenciaNotificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "notificarNormal" BOOLEAN NOT NULL DEFAULT false,
    "notificarModerado" BOOLEAN NOT NULL DEFAULT true,
    "notificarPeligro" BOOLEAN NOT NULL DEFAULT true,
    "horaInicioNotif" VARCHAR(5),
    "horaFinNotif" VARCHAR(5),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferenciaNotificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_activo_idx" ON "Usuario"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "SesionUsuario_token_key" ON "SesionUsuario"("token");

-- CreateIndex
CREATE INDEX "SesionUsuario_usuarioId_idx" ON "SesionUsuario"("usuarioId");

-- CreateIndex
CREATE INDEX "SesionUsuario_token_idx" ON "SesionUsuario"("token");

-- CreateIndex
CREATE INDEX "SesionUsuario_expiraEn_idx" ON "SesionUsuario"("expiraEn");

-- CreateIndex
CREATE INDEX "SensorConfig_usuarioId_idx" ON "SensorConfig"("usuarioId");

-- CreateIndex
CREATE INDEX "SensorConfig_activo_idx" ON "SensorConfig"("activo");

-- CreateIndex
CREATE INDEX "LecturaSensor_usuarioId_idx" ON "LecturaSensor"("usuarioId");

-- CreateIndex
CREATE INDEX "LecturaSensor_configuracionId_idx" ON "LecturaSensor"("configuracionId");

-- CreateIndex
CREATE INDEX "LecturaSensor_nivel_idx" ON "LecturaSensor"("nivel");

-- CreateIndex
CREATE INDEX "LecturaSensor_creadoEn_idx" ON "LecturaSensor"("creadoEn");

-- CreateIndex
CREATE INDEX "LecturaSensor_lecturaMQTT_idx" ON "LecturaSensor"("lecturaMQTT");

-- CreateIndex
CREATE INDEX "Alerta_usuarioId_idx" ON "Alerta"("usuarioId");

-- CreateIndex
CREATE INDEX "Alerta_configuracionId_idx" ON "Alerta"("configuracionId");

-- CreateIndex
CREATE INDEX "Alerta_nivel_idx" ON "Alerta"("nivel");

-- CreateIndex
CREATE INDEX "Alerta_leida_idx" ON "Alerta"("leida");

-- CreateIndex
CREATE INDEX "Alerta_creadoEn_idx" ON "Alerta"("creadoEn");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_idx" ON "AuditLog"("entidad");

-- CreateIndex
CREATE INDEX "AuditLog_creadoEn_idx" ON "AuditLog"("creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "PreferenciaNotificacion_usuarioId_key" ON "PreferenciaNotificacion"("usuarioId");

-- AddForeignKey
ALTER TABLE "SesionUsuario" ADD CONSTRAINT "SesionUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorConfig" ADD CONSTRAINT "SensorConfig_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturaSensor" ADD CONSTRAINT "LecturaSensor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturaSensor" ADD CONSTRAINT "LecturaSensor_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "SensorConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "SensorConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferenciaNotificacion" ADD CONSTRAINT "PreferenciaNotificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
