# BioSense IOT Backend - Spring Boot

Backend REST API para el sistema IoT BioSense IOT, construido con Spring Boot 3.x, Spring Security, JPA y MySQL.

## 📋 Requisitos Previos

- Java 21 JDK
- Maven 3.6 o superior
- MySQL 8.0 o superior
- Git

## 🛠️ Configuración Inicial

### 1. Instalar Prerrequisitos

#### Java 21
- Descargar desde: https://adoptium.net/temurin/releases/
- Configurar `JAVA_HOME` apuntando a la carpeta de instalación
- Agregar `%JAVA_HOME%\bin` al PATH

#### Maven 3.9+
- Descargar desde: https://maven.apache.org/download.cgi
- Configurar `MAVEN_HOME` apuntando a la carpeta de instalación
- Agregar `%MAVEN_HOME%\bin` al PATH

#### MySQL 8.0+
- Descargar e instalar desde: https://dev.mysql.com/downloads/mysql/
- Durante la instalación, crear usuario `Sala_sistemas` con contraseña `*fKw8&97/`

### 2. Crear Base de Datos MySQL

```bash
# Conectar a MySQL con las credenciales proporcionadas
mysql -u Sala_sistemas -p
# Contraseña: *fKw8&97/

# Crear la base de datos
CREATE DATABASE BioSense IOT;
GRANT ALL PRIVILEGES ON BioSense IOT.* TO 'Sala_sistemas'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Verificar Instalaciones

```bash
java -version    # Debe mostrar Java 21.x.x
mvn -version     # Debe mostrar Maven 3.9.x
mysql --version  # Debe mostrar MySQL 8.0.x
```

## 🚀 Instalación y Ejecución

### Opción 1: Maven

```bash
# Instalar dependencias
mvn clean install

# Ejecutar en desarrollo
mvn spring-boot:run

# Compilar a JAR
mvn clean package
# Ejecutar JAR
java -jar target/BioSense IOT-backend-1.0.0.jar
```

### Opción 1.5: Desarrollo con H2 Database (Sin MySQL)

Si tienes problemas instalando MySQL, puedes usar H2 Database para desarrollo:

1. El proyecto ya está configurado para usar H2
2. Simplemente ejecuta: `mvn spring-boot:run`
3. Accede a la consola H2 en: http://localhost:8080/h2-console
   - **JDBC URL:** `jdbc:h2:mem:BioSense IOT`
   - **User:** `sa`
   - **Password:** (vacío)

### Opción 2: IDE (IntelliJ IDEA, Eclipse, VS Code)

1. Abrir el proyecto en tu IDE
2. Configurar el JDK a Java 21
3. Click derecho en `BioSense IOTApplication.java`
4. Ejecutar como aplicación Java

## 📡 Endpoints API

### Autenticación

- **Login**: `POST /api/auth/login`
- **Registro**: `POST /api/auth/register`
- **Logout**: `POST /api/auth/logout`
- **Validar Token**: `GET /api/auth/validate`

### Sensores

- **Guardar Datos**: `POST /api/sensores/data`
- **Obtener Últimos Datos**: `GET /api/sensores/latest`
- **Obtener Historial**: `GET /api/sensores/history`
- **Datos por Rango Fechas**: `GET /api/sensores/range?inicio=2024-01-01T00:00:00&fin=2024-12-31T23:59:59`

## 🔐 Autenticación

Todos los endpoints (excepto login y registro) requieren un token JWT en el header:

```
Authorization: Bearer {TOKEN}
```

## 📝 Ejemplo de Uso

### Registrar Usuario

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "nombre": "Juan Pérez",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Guardar Datos de Sensores

```bash
curl -X POST http://localhost:8080/api/sensores/data \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "mq4": 150.5,
    "mq7": 200.3,
    "mq135": 180.2,
    "timestamp": "2024-01-01T12:00:00"
  }'
```

### Obtener Últimos Datos

```bash
curl -X GET http://localhost:8080/api/sensores/latest \
  -H "Authorization: Bearer {TOKEN}"
```

## 🏗️ Estructura del Proyecto

```
backend/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com.biosense/
    │   │   ├── BioSense IOTApplication.java (Clase principal)
    │   │   ├── config/ (Configuraciones)
    │   │   │   └── SecurityConfig.java
    │   │   ├── controller/ (Controladores REST)
    │   │   │   ├── AuthController.java
    │   │   │   └── SensorController.java
    │   │   ├── entity/ (Entidades JPA)
    │   │   │   ├── Usuario.java
    │   │   │   ├── SesionUsuario.java
    │   │   │   └── SensorDato.java
    │   │   ├── repository/ (Repositorios JPA)
    │   │   │   ├── UsuarioRepository.java
    │   │   │   ├── SesionUsuarioRepository.java
    │   │   │   └── SensorDatoRepository.java
    │   │   ├── service/ (Servicios)
    │   │   │   ├── AuthService.java
    │   │   │   ├── UsuarioService.java
    │   │   │   └── SensorService.java
    │   │   ├── security/ (Seguridad JWT)
    │   │   │   ├── JwtTokenProvider.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   └── CustomUserDetailsService.java
    │   │   ├── dto/ (Data Transfer Objects)
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── RegisterRequest.java
    │   │   │   ├── AuthResponse.java
    │   │   │   ├── UsuarioDto.java
    │   │   │   └── SensorDataDto.java
    │   │   └── exception/ (Manejo de excepciones)
    │   └── resources/
    │       └── application.yml (Configuración)
    └── test/
        └── java/com.biosense/
```

## 🔧 Tecnologías

- **Spring Boot 3.2.3**
- **Spring Security** - Autenticación y autorización
- **Spring Data JPA** - Acceso a datos
- **MySQL 8.0** - Base de datos
- **JJWT** - Tokens JWT
- **Lombok** - Reducir boilerplate
- **Validation** - Validación de datos
- **Thymeleaf** - Plantillas (si es necesario)

## 📊 Diagrama de Base de Datos

```
USUARIOS
├── id (PK, UUID)
├── email (UNIQUE)
├── nombre
├── password (bcrypted)
├── rol
├── google_id
├── activo
├── verificado
├── created_at
└── updated_at

SESIONES_USUARIO
├── id (PK, UUID)
├── usuario_id (FK)
├── token
├── expiracion
├── activo
└── created_at

SENSOR_DATOS
├── id (PK, UUID)
├── usuario_id (FK)
├── mq4
├── mq7
├── mq135
├── nivel (ENUM)
├── aqi
├── timestamp
└── created_at
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verificar que MySQL está corriendo
- Verificar credenciales en `application.yml`
- Verificar que la base de datos existe

### Error: "Port 8080 already in use"
```bash
# En Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# En Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Error: "JWT token is invalid"
- Verificar que el token es válido y no ha expirado
- Verificar que el formato es `Bearer {TOKEN}`

## 📞 Variables de Configuración

| Variable | Valor Defecto | Descripción |
|----------|----------------|-------------|
| `jwt.secret` | key-256-bits... | Clave secreta para JWT |
| `jwt.expiration` | 604800000 | Expiración en ms (7 días) |
| `spring.datasource.url` | localhost:3306 | URL de MySQL |
| `spring.jpa.hibernate.ddl-auto` | update | Auto-update schema |

## 📄 Licencia

Este proyecto es parte de BioSense IOT IoT System.

## 👤 Autor

Desarrollado para BioSense IOT.

---

**Última actualización**: Enero 2024