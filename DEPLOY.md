# DevTrack — Guía de Despliegue en Dokploy (Docker Compose)

> Última actualización: 2026-03-03

---

## Arquitectura

Un solo `docker-compose.yml` levanta **dos contenedores** en la misma red interna:

```
┌─────────────────────────────────────┐
│  Docker Compose (Dokploy)           │
│                                     │
│  ┌──────────┐    ┌───────────────┐  │
│  │ postgres │◄───│  app (Next.js)│  │
│  │ :5432    │    │  :3000        │  │
│  └──────────┘    └───────────────┘  │
└─────────────────────────────────────┘
```

- `postgres` — PostgreSQL 16 Alpine con volumen persistente  
- `app` — Next.js (standalone) que en el arranque aplica `prisma db push` automáticamente

---

## Requisitos previos

- Servidor con **Dokploy** instalado
- Repositorio en GitHub / GitLab / Gitea con este código
- Dominio o IP apuntando al servidor

---

## Despliegue paso a paso

### 1 · Crear el proyecto y el servicio Compose

1. En Dokploy → **New Project** → nombre: `devtrack`
2. Dentro del proyecto → **New Service → Docker Compose**
3. En **Source**:
   - Elige tu proveedor Git y selecciona el repositorio
   - Branch: `main`
   - **Compose path:** `devtrack/docker-compose.yml`  
     *(ajusta si el repo es un monorepo y `docker-compose.yml` no está en la raíz del repo)*

### 2 · Configurar las variables de entorno

En la pestaña **Environment** del servicio, añade las siguientes variables  
(copia desde `.env.example` y rellena los valores reales):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=devtrack

AUTH_SECRET=genera_con_openssl_rand_base64_32

APP_URL=https://tu-dominio.com

NEXT_PUBLIC_APP_NAME=DevTrack
NEXT_PUBLIC_WORK_HOURS_START=09:00
NEXT_PUBLIC_WORK_HOURS_END=18:00
NEXT_PUBLIC_LATE_THRESHOLD_MINUTES=15
NEXT_PUBLIC_MIN_HOURS_PER_DAY=6
NEXT_PUBLIC_PASSING_SCORE=3.0
NEXT_PUBLIC_INTERNSHIP_WEEKS=12
```

> **Generar `AUTH_SECRET`** (ejecuta en cualquier terminal):
> ```bash
> openssl rand -base64 32
> ```

### 3 · Configurar el dominio

1. En la pestaña **Domains** del servicio → **Add Domain**
2. Host: `tu-dominio.com`
3. Puerto: `3000`  
4. HTTPS: activar (Let's Encrypt se configura automáticamente)

### 4 · Desplegar

Haz clic en **Deploy**. Dokploy:
1. Clona el repositorio
2. Hace `docker compose build` (genera el cliente Prisma + build Next.js ≈ 3–5 min la primera vez)
3. Levanta `postgres` → espera a que esté healthy
4. Levanta `app` → ejecuta `prisma db push` → arranca el servidor

**Logs esperados al arrancar `app`:**
```
════════════════════════════════════════
  DevTrack — Docker startup
════════════════════════════════════════
▶  Applying database schema (prisma db push)...
✔  Schema applied.
▶  Starting Next.js server on port 3000...
```

---

## Cargar datos iniciales (seed)

Ejecuta el seed **una sola vez** después del primer despliegue exitoso.

En Dokploy → servicio → pestaña **Terminal**, selecciona el contenedor `app`:

```bash
# From inside the `app` container (recommended):
npm run seed

# Or from the host using Docker Compose (works with /bin/sh):
docker compose exec app sh -c "npm run seed"
```

Esto crea el usuario mentor inicial con las credenciales definidas en `prisma/seed.ts`.

Credenciales incluidas por el seed (ejemplo):

- Admin:    admin@devtrack.com         / password123
- Admin:    loritox3421@gmail.com      / podereterno1
- Mentor 1: carlos@devtrack.com       / password123
- Mentor 2: laura@devtrack.com        / password123
- Intern:   maria@devtrack.com        / password123


---

## Actualizar la aplicación

1. Haz `git push` a la branch configurada
2. Dokploy detecta el push automáticamente (si tienes el webhook activo)  
   — o en el panel → **Redeploy** manualmente
3. La build regenera el cliente Prisma y compila Next.js
4. `prisma db push` aplica los cambios de schema al arrancar

> Los datos de PostgreSQL persisten gracias al volumen `postgres_data` — no se borran en los redespliegues.

---

## Uso local con Docker Compose

Para probar el stack completo localmente antes de subir:

```bash
# Copia y edita las variables
cp .env.example .env

# Levanta todo (primera vez tarda ~3-5 min)
docker compose up --build

# En otro terminal, ejecuta el seed (solo la primera vez)
docker compose exec app node node_modules/tsx/dist/cli.mjs prisma/seed.ts

# Accede a http://localhost:3000
```

Para parar:
```bash
docker compose down          # conserva los datos
docker compose down -v       # borra también el volumen de postgres
```

---

## Resolución de problemas

### `app` falla al conectar a postgres

- El healthcheck del contenedor `postgres` debe pasar antes de que `app` arranque
- `depends_on: postgres: condition: service_healthy` ya está configurado
- Si falla repetidamente, revisa que `POSTGRES_PASSWORD` sea el mismo en ambos lados

### `AUTH_SECRET` / sesión inválida

- `AUTH_SECRET` en Dokploy debe ser el mismo valor que se usó en el build  
  *(solo importa si `NEXT_PUBLIC_*` ya están quemadas en el bundle — ver abajo)*

### Variables `NEXT_PUBLIC_*` muestran valores incorrectos

- Se inyectan en **build time**, no en runtime
- Si las cambias **después** de la primera build, haz **Rebuild** (no solo Restart)

### Error `Module not found: src/generated/prisma`

- El `Dockerfile` ejecuta `npx prisma generate` antes de `npm run build`
- Revisa los logs de build y busca: `✓ Generated Prisma Client`

### Puerto 3000 no accesible tras el despliegue

- Verifica que en Dokploy → Domains → Port está configurado como `3000`
- El servicio `app` solo expone el puerto `3000`

---

## Resumen de archivos de despliegue

| Archivo | Propósito |
|---|---|
| `docker-compose.yml` | Define servicios `postgres` + `app` con healthcheck y red interna |
| `Dockerfile` | Build multi-stage de Next.js (standalone) |
| `docker-entrypoint.sh` | `prisma db push` automático + arranque del servidor |
| `.dockerignore` | Excluye `node_modules`, `.next`, `.env*` del build context |
| `.env.example` | Variables requeridas (sin secretos — se commitea al repo) |
| `.env.example` | Variables requeridas (sin secretos — se commitea al repo) |
