# 🗄️ PostgreSQL - Guía de Instalación

## 💻 Windows

### Opción A: PostgreSQL Instalador Oficial (Recomendado)

1. **Descargar:**
   - Ve a: https://www.postgresql.org/download/windows/
   - Descarga PostgreSQL 16 (versión más nueva estable)

2. **Instalar:**
   - Ejecuta el instalador
   - **Importante:** Recuerda la contraseña del usuario `admin123`
   - Puerto: `5432` (por defecto)
   - Lenguaje: Inglés
   - Marca "pgAdmin 4" para interfaz gráfica

3. **Verificar instalación:**
   ```bash
   psql --version
   ```

### Opción B: Docker + PostgreSQL (Alternativa)

Si tienes Docker:

```bash
docker run --name postgres-BioSense IOT \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=BioSense IOT_dev \
  -p 5432:5432 \
  -d postgres:16
```

---

## 🗄️ Crear Base de Datos

### Abrir terminal PostgreSQL

```bash
# Windows: búscalo en Inicio > SQL Shell (psql)
# O en terminal:
psql -U postgres
```

### Crear base de datos

```sql
-- Conectarse como postgres (ya está)
-- Crear base de datos
CREATE DATABASE BioSense IOT_dev;

-- Crear usuario (opcional, más seguro)
CREATE USER BioSense IOT WITH PASSWORD 'BioSense IOT_password_123';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE BioSense IOT_dev TO BioSense IOT;

-- Ver bases de datos creadas
\l

-- Desconectar
\q
```

---

## 🔗 Variables de Entorno

En tu archivo `.env.local`:

```env
# Opción 1: Usuario postgres (por defecto)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/BioSense IOT_dev"

# Opción 2: Usuario específico (más seguro)
DATABASE_URL="postgresql://BioSense IOT:BioSense IOT_password_123@localhost:5432/BioSense IOT_dev"

# Opción 3: En Vercel Postgres (url secreta)
DATABASE_URL="postgresql://[usuario]:[password]@[host]:[puerto]/[db]?sslmode=require"
```

---

## 🚀 Migrations con Prisma

Una vez instalado PostgreSQL y configurado `.env.local`:

### 1. Crear migración inicial

```bash
npx prisma migrate dev --name init
```

Esto:
1. ✅ Crea las tablas en la BD
2. ✅ Genera seed (datos iniciales) si lo pides

### 2. Ver datos en pgAdmin

1. Abre pgAdmin: http://localhost:5050
2. Login: admin@pgadmin.org / admin
3. En el árbol: Servers > PostgreSQL > Bases de datos > BioSense IOT_dev
4. Ve todas las tablas creadas

### 3. Ver datos en terminal

```bash
# Conectarse a la BD
psql -U postgres -d BioSense IOT_dev

# Ver tablas
\dt

# Ver columnas de una tabla
\d "Usuario"

# Ver todos los usuarios
SELECT * FROM "Usuario";

# Desconectar
\q
```

---

## 🗑️ Reset (Borrar todo y empezar)

**CUIDADO: Esto borra todos los datos**

```bash
# Opción 1: Reset completo en Prisma
npx prisma migrate reset

# Opción 2: Borrar base de datos y recrear
psql -U postgres -c "DROP DATABASE BioSense IOT_dev;"
psql -U postgres -c "CREATE DATABASE BioSense IOT_dev;"
npx prisma migrate dev --name init
```

---

## 🛠️ Troubleshooting

### "connection refused"
- ✅ PostgreSQL no está corriendo
- Solución: Inicia PostgreSQL (Windows: busca en Servicios > postgresql)

### "password authentication failed"
- ✅ Contraseña incorrecta en .env.local
- Revisar: https://www.postgresql.org/docs/current/libpq-envvar.html

### "database does not exist"
- ✅ `BioSense IOT_dev` no fue creada
- Solución: Crear con SQL de arriba

### Prisma no ve los cambios
```bash
npx prisma db push --skip-generate
npx prisma generate
```

---

## 📊 Archivo Prisma (schema.prisma)

Ubicación: `prisma/schema.prisma`

Define:
- Tablas del BD
- Relaciones
- Tipos de datos
- Índices

Cambios:
```bash
# Ver cambios antes de aplicar
npx prisma migrate dev --name [nombre-cambio]

# Ejemplo: Agregar campo
# Edita schema.prisma > Ejecuta comando arriba
```

---

## 🔄 Flujo Completo

```
1. Instalar PostgreSQL
   ↓
2. Crear base de datos "BioSense IOT_dev"
   ↓
3. Configurar .env.local con DATABASE_URL
   ↓
4. Ejecutar: npx prisma migrate dev --name init
   ↓
5. ✅ Tablas creadas
   ↓
6. Iniciar app: npm run dev
   ↓
7. Auth endpoints listos: /api/auth/login, /api/auth/register
```

---

## 📱 Para Producción (Vercel Postgres)

Cuando subas a Vercel:

1. Vercel > Project > Settings > Environment Variables
2. Agregar: `DATABASE_URL` = [URL secreta de Vercel Postgres]
3. En terminal:
   ```bash
   npx prisma migrate deploy
   ```

---

## 📚 Documentación

- **Prisma docs**: https://www.prisma.io/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

---

**¡Listo!** ✅ BD configurada y lista para usarse en la app.
