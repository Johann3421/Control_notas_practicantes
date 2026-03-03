# DevTrack — Intern Management System

> **Mide el crecimiento. Acelera el talento.**

Plataforma full-stack de seguimiento para practicantes de desarrollo de software. Panel de mentor con evaluaciones semanales, asistencia, tareas y reportes. Portal de practicante con dashboard, feedback, roadmap 3D interactivo y métricas en tiempo real.

---

## Tech Stack

| Capa               | Tecnología                                    |
| ------------------- | --------------------------------------------- |
| Framework           | Next.js 16 (App Router)                       |
| Lenguaje            | TypeScript                                    |
| Estilos             | Tailwind CSS v4                               |
| Base de datos       | PostgreSQL + Prisma 7                          |
| Autenticación       | NextAuth v5 (Auth.js) con Credentials         |
| Estado              | Zustand                                       |
| Formularios         | React Hook Form + Zod                          |
| Gráficas            | Recharts                                      |
| 3D                  | React Three Fiber + Drei                       |
| Exportes            | CSV (papaparse) + TXT Report                   |
| Notificaciones      | Sonner                                        |
| Íconos              | Lucide React                                  |

---

## Inicio Rápido

### Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

### Instalación

```bash
cd devtrack
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

### Variables de Entorno (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/devtrack"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_WORK_START="09:00"
NEXT_PUBLIC_WORK_END="18:00"
NEXT_PUBLIC_LATE_THRESHOLD_MIN="15"
NEXT_PUBLIC_MIN_HOURS="6"
NEXT_PUBLIC_PASSING_SCORE="3.0"
NEXT_PUBLIC_INTERNSHIP_WEEKS="12"
```

---

## Credenciales de Prueba

| Rol     | Email                    | Contraseña  |
| ------- | ------------------------ | ----------- |
| Admin   | admin@devtrack.com       | password123 |
| Mentor  | carlos@devtrack.com      | password123 |
| Mentor  | laura@devtrack.com       | password123 |
| Intern  | maria@devtrack.com       | password123 |
| Intern  | alex@devtrack.com        | password123 |
| Intern  | sofia@devtrack.com       | password123 |
| Intern  | diego@devtrack.com       | password123 |
| Intern  | valentina@devtrack.com   | password123 |

---

## Fórmula de Scoring

```
Tech Average = (codeQuality + problemSolving + gitUsage + tooling + codeReview + architecture) / 6
Soft Average = (communication + teamwork + initiative + timeManagement + adaptability + documentation) / 6
Overall = Tech × 0.60 + Soft × 0.40
```

### Recomendación de Promoción

| Resultado    | Score  | Asistencia | Tareas |
| ------------ | ------ | ---------- | ------ |
| PROMOVIDO    | >= 4.0 | >= 90%     | >= 85% |
| GRADUADO     | >= 3.0 | >= 75%     | >= 60% |
| EXTENDIDO    | >= 2.5 | >= 70%     | —      |
| NO APROBADO  | < 2.5  | < 70%      | —      |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/login/         # Página de login
│   ├── api/                  # Rutas API
│   ├── intern/               # Portal del practicante
│   └── mentor/               # Panel del mentor
├── components/
│   ├── intern/               # Componentes del portal
│   ├── mentor/               # Componentes del panel
│   ├── three/                # Componentes 3D (R3F)
│   └── ui/                   # Sistema de diseño
├── hooks/                    # Custom hooks
├── lib/                      # Utilidades core
├── store/                    # Estado global (Zustand)
└── types/                    # Types e interfaces
```

## Licencia

MIT
