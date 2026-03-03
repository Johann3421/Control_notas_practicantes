# Ejecutar DevTrack en local

Instrucciones rápidas para configurar y ejecutar el proyecto DevTrack en tu máquina, y soluciones a los errores más comunes que aparecen al seguir el README.

## Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm

## Variables de entorno
Crea un archivo `.env` en la raíz del proyecto (ya tienes uno). Debe contener al menos:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/devtrack"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WORK_HOURS_START="09:00"
NEXT_PUBLIC_WORK_HOURS_END="18:00"
NEXT_PUBLIC_LATE_THRESHOLD_MINUTES=15
NEXT_PUBLIC_MIN_HOURS_PER_DAY=6
NEXT_PUBLIC_PASSING_SCORE=3.0
NEXT_PUBLIC_INTERNSHIP_WEEKS=12
```

Asegúrate de que `DATABASE_URL` apunta a una base de datos PostgreSQL accesible y que el servicio está activo.

## Instalación y primer arranque

1. Instala dependencias:

```bash
npm install
```

2. Genera el cliente de Prisma:

```bash
npx prisma generate
```

3. Crea/esquema la BD (empaqueta el esquema en la base de datos):

```bash
npx prisma db push
```

4. (Opcional) Poblá datos de ejemplo (seed):

```bash
npx tsx prisma/seed.ts
```

5. Ejecutar en desarrollo:

```bash
npm run dev
```

6. Verificar build de producción (local):

```bash
npm run build
```

## Errores comunes y soluciones

- `npx prisma db push` falla / `Exit Code 1`:
  - Verifica que `DATABASE_URL` sea correcto y PostgreSQL esté corriendo.
  - Prueba conectarte manualmente con psql o pgcli:

    ```bash
    psql "${DATABASE_URL}"
    ```

- `PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"`:
  - Prisma 7 por defecto puede generar un cliente que requiere un adaptador. Soluciones:
    1) Instala el adaptador para Postgres y el driver: `npm install @prisma/adapter-pg pg`.
    2) Asegúrate de ejecutar `npx prisma generate` después de instalar.
    3) El proyecto ya contiene una inicialización de cliente que usa el adaptador (`src/lib/prisma.ts`), por lo que bastará con tener `DATABASE_URL` y las dependencias instaladas.

- Warnings en `next build` sobre `node:*` (Edge Runtime):
  - Si Next intenta empaquetar el cliente Prisma en código que se ejecuta en el Edge (middleware, funciones edge), aparecerán warnings porque `node:*` no está disponible en ese runtime.
  - Evita importar `prisma` desde archivos que se ejecutan en Edge/middleware. Usa llamadas server-only o proxies, o revisa `src/middleware.ts` para que no importe código que a su vez importe `prisma`.

- `Prisma generated client path` y errores `Cannot find module '../src/generated/prisma'`:
  - El cliente generado suele exportarse en `src/generated/prisma/client.ts`. Importa con:

    ```ts
    import { PrismaClient } from "@/generated/prisma/client"
    ```

- Tip: si cambias el `generator` en `prisma/schema.prisma`, corre `npx prisma generate` otra vez.

## Cómo diagnosticar problemas rápidamente

- Repetir pasos básicos:

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

- Si `db push` o `seed` fallan, copia el mensaje de error completo y verificá:
  - `DATABASE_URL`
  - que la base de datos exista y se pueda acceder
  - versiones de Postgres / permisos

## Notas específicas (lo que suele aparecer en este repo)

- Si ves errores tipo *Property 'X' does not exist on type 'Y'* al compilar, significa que el esquema de Prisma y los tipos en `src/types` no están alineados. El repo ya contiene scripts y cambios para alinear schema ↔ tipos. Si modificaste `prisma/schema.prisma`, vuelve a `npx prisma generate`.

- Si ves problemas al ejecutar `npm run build` relacionados con el cliente Prisma en el middleware/edge, asegúrate que `src/lib/prisma.ts` usa inicialización lazy y que tu middleware no fuerza la creación del cliente en tiempo de compilación.

## Si todavía te sale un error ahora

1. Copia aquí el error completo (todo el stack/console), lo revisaré y aplicaré la corrección necesaria.
2. Si preferís, puedo ejecutar los comandos en tu repo (db push / seed / build). ¿Querés que los ejecute ahora?

---
Archivo creado: `RUN_LOCAL.md`

Si querés, lo agrego al `README.md` principal o ejecuto `npx prisma db push` y `npx tsx prisma/seed.ts` para reproducir el error y solucionarlo directamente.
