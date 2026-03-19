# ⚡ SETUP RÁPIDO: BASE DE DATOS + AUTENTICACIÓN

## 🎯 Plan Completo

```
1. Instalar PostgreSQL          (5 min)
2. Crear base de datos          (2 min)
3. Configurar .env.local        (1 min)
4. Ejecutar migrations          (2 min)
5. Probar endpoints Auth        (5 min)
6. Integrar en componentes      (10 min)

Total: ~30 minutos ⏱️
```

---

## 📦 Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `prisma/schema.prisma` | Esquema de BD (tablas, relaciones) |
| `lib/auth.ts` | Funciones de JWT, bcrypt, hashing |
| `lib/prisma.ts` | Cliente Prisma singleton |
| `lib/auth-middleware.ts` | Middleware de protección |
| `lib/types.ts` (actualizado) | Tipos de autenticación |
| `app/api/auth/login/route.ts` | Endpoint POST/GET login |
| `app/api/auth/register/route.ts` | Endpoint POST registro |
| `hooks/use-auth.ts` | Hook React para auth |
| `.env.local` (actualizado) | Variables de entorno |
| `DATABASE_SETUP.md` | Guía de PostgreSQL |

---

## ⚙️ PASO 1: PostgreSQL

### Windows

1. **Descargar:**
   - https://www.postgresql.org/download/windows/
   - Versión 16

2. **Instalar:**
   - Siguiente > Siguiente > ...
   - **GUARDAR** contraseña de `postgres`
   - Puerto: 5432

3. **Verificar:**
   ```bash
   psql --version
   ```

### Linux/Mac

```bash
# macOS
brew install postgresql@16

# Linux
sudo apt install postgresql postgresql-contrib
```

---

## 🗄️ PASO 2: Crear Base de Datos

### Abrir psql

```bash
# Windows: Busca "SQL Shell" en Inicio
# O:
psql -U postgres
```

### Crear BD

```sql
CREATE DATABASE BioSense IOT_dev;
\q  -- Salir
```

---

## 🔐 PASO 3: Configurar .env.local

Ya actualizado automáticamente, pero verifica:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/BioSense IOT_dev"
JWT_SECRET=cambia_esto_algo_seguro_1234567890
JWT_EXPIRES_IN=7d
```

---

## 🚀 PASO 4: Migrations

### Crear tablas en BD

```bash
cd c:\Users\alexi\Desktop\BioSense IOT1

# Ejecutar migrations
npx prisma migrate dev --name init

# Responde "y" si te pide crear un seed script
```

✅ Si ves esto, ¡funciona!:
```
✔ Your database has been reset
✔ Generated Prisma Client
✔ Ran all pending migrations
✔ Prisma schema validated
```

---

## 🧪 PASO 5: Probar Endpoints

### Con CURL o Postman

#### Registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "nombre": "Test User",
    "password": "Seguro123!",
    "confirmPassword": "Seguro123!"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGc...",
    "usuario": {
      "id": "cltx...",
      "email": "test@ejemplo.com",
      "nombre": "Test User",
      "rol": "usuario",
      "activo": true,
      "verificado": false
    }
  }
}
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Seguro123!"
  }'
```

---

## 💻 PASO 6: Usar en React

### Componente Login

```tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      // Se redirige automáticamente en useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en login')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Login'}
      </button>
    </form>
  )
}
```

### Proteger Componente

```tsx
'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedPage() {
  const { isAutenticado, usuario, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAutenticado) {
      router.push('/login')
    }
  }, [isAutenticado, isLoading, router])

  if (isLoading) return <p>Cargando...</p>
  if (!isAutenticado) return null

  return (
    <div>
      <h1>Bienvenido, {usuario?.nombre}!</h1>
      {/* Tu contenido */}
    </div>
  )
}
```

### API Call Protegida

```tsx
import { fetchWithAuth } from '@/hooks/use-auth'

async function cargarSensores() {
  const response = await fetchWithAuth('/api/sensores')
  const data = await response.json()
  console.log(data)
}
```

---

## ✅ Checklist

- [ ] PostgreSQL instalado (`psql --version` funciona)
- [ ] Base de datos `BioSense IOT_dev` creada
- [ ] `.env.local` tiene `DATABASE_URL`
- [ ] `npx prisma migrate dev --name init` ejecutado exitosamente
- [ ] Endpoint `/api/auth/register` responde
- [ ] Endpoint `/api/auth/login` responde
- [ ] Puesto crear usuario en registro
- [ ] Puesto login con ese usuario
- [ ] Token se guarda en localStorage
- [ ] Componentes pueden usar `useAuth()`

---

## 🔍 Verificar BD

### Visual

1. **Descargar pgAdmin:**
   - https://www.pgadmin.org/download/
   
2. **Login:** admin@pgadmin.org / admin

3. **Ver tablas:** Servers > PostgreSQL > BioSense IOT_dev

### Terminal

```bash
psql -U postgres -d BioSense IOT_dev

# Ver tablas
\dt

# Ver usuarios creados
SELECT id, email, nombre, rol FROM "Usuario";

# Salir
\q
```

---

## 🐛 Problemas Comunes

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` | PostgreSQL no está corriendo (inicia el servicio) |
| `password authentication failed` | Contraseña en .env.local es incorrecta |
| `database "BioSense IOT_dev" does not exist` | Crear con SQL de arriba |
| Prisma error | `npm install` y `npx prisma generate` |
| Token expirado | Logout y login nuevamente |

---

## 🚀 Siguiente Fase

Una vez funcionando:

1. ✅ Crear página Login/Registro
2. ✅ Guardar token en cookies (más seguro que localStorage)
3. ✅ Endpoint para crear/actualizar sensores
4. ✅ Endpoint para guardar lecturas MQTT en BD
5. ✅ Dashboard con gráficos históricos
6. ✅ Alertas automáticas

---

## 📞 Resumen Rápido

```bash
# 1. PostgreSQL ya debería estar instalado
# 2. Crear BD:
CREATE DATABASE BioSense IOT_dev;

# 3. Verificar .env.local
cat .env.local

# 4. Migrations:
npx prisma migrate dev --name init

# 5. Ver datos:
npx prisma studio  # Interfaz visual

# 6. Probar app:
npm run dev
```

---

**¡Sistema de autenticación completo y listo! 🎉**

Próximo: Integrar login en la UI
