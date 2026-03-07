import 'dotenv/config'
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

// Create a PrismaClient with the required adapter (Prisma 7+ requires this)
const rawDatabaseUrl = process.env.DATABASE_URL ?? ""
const connectionString = rawDatabaseUrl.replace(/^\s*"|"\s*$/g, "").replace(/^\s*'|'\s*$/g, "").trim()
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱  Seeding DevTrack database...")

  // Clean existing data
  await prisma.evaluationGoal.deleteMany()
  await prisma.weeklyEvaluation.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.task.deleteMany()
  await prisma.learningGoal.deleteMany()
  await prisma.intern.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash("password123", 12)
  const passwordJohann = await bcrypt.hash("podereterno1", 12)

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin DevTrack",
      email: "admin@devtrack.com",
      password,
      role: "ADMIN",
    },
  })
  console.log(`  ✅ Admin: ${admin.email}`)

  // Create Johann Admin
  const adminJohann = await prisma.user.create({
    data: {
      name: "Tec. Ing. Johann Abad",
      email: "loritox3421@gmail.com",
      password: passwordJohann,
      role: "ADMIN",
    },
  })
  console.log(`  ✅ Admin: ${adminJohann.email}`)

  // Create Mentors
  const mentor1 = await prisma.user.create({
    data: {
      name: "Carlos Mendoza",
      email: "carlos@devtrack.com",
      password,
      role: "MENTOR",
    },
  })

  const mentor2 = await prisma.user.create({
    data: {
      name: "Laura Vásquez",
      email: "laura@devtrack.com",
      password,
      role: "MENTOR",
    },
  })
  console.log(`  ✅ Mentores: ${mentor1.email}, ${mentor2.email}`)

  // Create Interns
  const internsData = [
    {
      name: "María García López",
      email: "maria@devtrack.com",
      code: "INT-001",
      university: "Universidad Nacional Autónoma",
      stack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      mentorId: mentor1.id,
    },
    {
      name: "Alejandro Ramírez",
      email: "alex@devtrack.com",
      code: "INT-002",
      university: "Instituto Tecnológico",
      stack: ["Vue.js", "Python", "Django", "MongoDB"],
      mentorId: mentor1.id,
    },
    {
      name: "Sofía Hernández",
      email: "sofia@devtrack.com",
      code: "INT-003",
      university: "Universidad Politécnica",
      stack: ["React", "Next.js", "GraphQL", "Prisma"],
      mentorId: mentor1.id,
    },
    {
      name: "Diego Torres Martín",
      email: "diego@devtrack.com",
      code: "INT-004",
      university: "Universidad de Guadalajara",
      stack: ["Angular", "Java", "Spring Boot", "MySQL"],
      mentorId: mentor2.id,
    },
    {
      name: "Valentina Cruz Reyes",
      email: "valentina@devtrack.com",
      code: "INT-005",
      university: "Tecnológico de Monterrey",
      stack: ["React Native", "TypeScript", "Firebase", "AWS"],
      mentorId: mentor2.id,
    },
  ]

  const interns = []
  for (const data of internsData) {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
        role: "INTERN",
        internProfile: {
          create: {
            code: data.code,
            university: data.university,
            stack: data.stack,
            startDate: new Date("2025-01-13"),
            endDate: new Date("2025-04-07"),
            status: "ACTIVE",
            mentorId: data.mentorId,
          },
        },
      },
      include: { internProfile: true },
    })
    interns.push(user)
    console.log(`  ✅ Intern: ${user.email} (${data.code})`)
  }

  // Create evaluations for each intern (weeks 1-4)
  for (const intern of interns) {
    if (!intern.internProfile) continue
    const mentorId = intern.internProfile.mentorId!

    for (let week = 1; week <= 4; week++) {
      const base = (2 + week * 0.4) * 4        // scales 2.4-3.6 → 9.6-14.4 on 0-20
      const jitter = () => Math.round(base + (Math.random() - 0.5) * 4.8)

      const codeQuality    = Math.min(20, Math.max(0, jitter()))
      const problemSolving = Math.min(20, Math.max(0, jitter()))
      const gitUsage       = Math.min(20, Math.max(0, jitter()))
      const tooling        = Math.min(20, Math.max(0, jitter()))
      const codeReview     = Math.min(20, Math.max(0, jitter()))
      const architecture   = Math.min(20, Math.max(0, jitter()))

      const communication  = Math.min(20, Math.max(0, jitter()))
      const teamwork       = Math.min(20, Math.max(0, jitter()))
      const initiative     = Math.min(20, Math.max(0, jitter()))
      const timeManagement = Math.min(20, Math.max(0, jitter()))
      const adaptability   = Math.min(20, Math.max(0, jitter()))
      const documentation  = Math.min(20, Math.max(0, jitter()))

      const techAvg =
        (codeQuality + problemSolving + gitUsage + tooling + codeReview + architecture) / 6
      const softAvg =
        (communication + teamwork + initiative + timeManagement + adaptability + documentation) / 6
      const overallAvg = techAvg * 0.6 + softAvg * 0.4

      const weekStartDate = new Date("2025-01-13")
      weekStartDate.setDate(weekStartDate.getDate() + (week - 1) * 7)
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekEndDate.getDate() + 6)

      await prisma.weeklyEvaluation.create({
        data: {
          internId: intern.internProfile.id,
          evaluatedBy: mentorId,
          weekNumber: week,
          weekStart: weekStartDate,
          weekEnd: weekEndDate,
          codeQuality,
          problemSolving,
          gitUsage,
          tooling,
          codeReview,
          architecture,
          communication,
          teamwork,
          initiative,
          timeManagement,
          adaptability,
          documentation,
          techAverage: Math.round(techAvg * 100) / 100,
          softAverage: Math.round(softAvg * 100) / 100,
          overallAverage: Math.round(overallAvg * 100) / 100,
          strengths: `Semana ${week}: Buen progreso en habilidades técnicas. Continuar practicando patrones de diseño.`,
          improvements: `Semana ${week}: Buena comunicación con el equipo. Mejorar la gestión del tiempo en tareas complejas.`,
          goals: `Evaluación semana ${week} completada. El practicante muestra tendencia positiva.`,
        },
      })
    }

    // Update intern overall score
    const evals = await prisma.weeklyEvaluation.findMany({
      where: { internId: intern.internProfile.id },
    })
    const avg = evals.reduce((a, e) => a + Number(e.overallAverage), 0) / evals.length
    await prisma.intern.update({
      where: { id: intern.internProfile.id },
      data: { overallScore: Math.round(avg * 100) / 100, currentWeek: 4 },
    })
  }
  console.log("  ✅ Evaluaciones semanales (4 semanas × 5 interns)")

  // Create attendance records (20 business days)
  const statuses = ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "PRESENT", "PRESENT", "ABSENT"] as const
  for (const intern of interns) {
    if (!intern.internProfile) continue
    const startDate = new Date("2025-01-13")

    for (let d = 0; d < 20; d++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + d)
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const clockIn = status === "ABSENT" ? null : status === "LATE" ? new Date(`2025-01-13T09:25:00`) : new Date(`2025-01-13T08:55:00`)
      const clockOut = status === "ABSENT" ? null : new Date(`2025-01-13T18:05:00`)

      await prisma.attendanceRecord.create({
        data: {
          internId: intern.internProfile.id,
          date,
          status,
          checkIn: clockIn,
          checkOut: clockOut,
          lateMinutes: status === "LATE" ? 25 : 0,
          hoursWorked: status === "ABSENT" ? 0 : 8.5,
          recordedBy: intern.internProfile.mentorId!,
        },
      })
    }
  }
  console.log("  ✅ Registros de asistencia (20 días × 5 interns)")

  // Create tasks
  const taskTemplates = [
    { title: "Configurar ESLint y Prettier", type: "FEATURE" as const, priority: "HIGH" as const },
    { title: "Implementar componente de login", type: "FEATURE" as const, priority: "HIGH" as const },
    { title: "Escribir tests unitarios para auth", type: "TESTING" as const, priority: "MEDIUM" as const },
    { title: "Documentar API de autenticación", type: "DOCUMENTATION" as const, priority: "LOW" as const },
    { title: "Fix: Timeout en conexión a DB", type: "BUG_FIX" as const, priority: "CRITICAL" as const },
    { title: "Investigar patrones de caching", type: "RESEARCH" as const, priority: "MEDIUM" as const },
  ]

  const taskStatuses = ["DONE", "DONE", "IN_PROGRESS", "TODO", "IN_REVIEW", "TODO"] as const

  for (const intern of interns) {
    if (!intern.internProfile) continue
    for (let i = 0; i < taskTemplates.length; i++) {
      const t = taskTemplates[i]
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (i * 3) + 1)

      await prisma.task.create({
        data: {
          title: t.title,
          description: `Tarea asignada a ${intern.name}: ${t.title}`,
          internId: intern.internProfile.id,
          type: t.type,
          priority: t.priority,
          status: taskStatuses[i],
          dueDate,
          assignedBy: intern.internProfile.mentorId!,
        },
      })
    }
  }
  console.log("  ✅ Tareas (6 × 5 interns)")

  // Create learning goals
  const goalTemplates = [
    { title: "Dominar React Hooks avanzados", category: "TECHNICAL" as const, priority: "HIGH" as const },
    { title: "Implementar autenticación OAuth", category: "TECHNICAL" as const, priority: "HIGH" as const },
    { title: "Diseñar APIs RESTful", category: "TECHNICAL" as const, priority: "MEDIUM" as const },
    { title: "Mejorar comunicación en equipo", category: "SOFT_SKILL" as const, priority: "MEDIUM" as const },
    { title: "Practicar pair programming", category: "SOFT_SKILL" as const, priority: "LOW" as const },
    { title: "Gestión de tiempo con Pomodoro", category: "PROCESS" as const, priority: "LOW" as const },
  ]

  const goalStatuses = ["COMPLETED", "IN_PROGRESS", "IN_PROGRESS", "COMPLETED", "NOT_STARTED", "NOT_STARTED"] as const

  for (const intern of interns) {
    if (!intern.internProfile) continue
    for (let i = 0; i < goalTemplates.length; i++) {
      const g = goalTemplates[i]
      await prisma.learningGoal.create({
        data: {
          title: g.title,
          description: `Objetivo: ${g.title}`,
          internId: intern.internProfile.id,
          category: g.category,
          status: goalStatuses[i],
          priority: g.priority,
          targetWeek: i + 1,
        },
      })
    }
  }
  console.log("  ✅ Objetivos de aprendizaje (6 × 5 interns)")

  console.log("\n✨ Seed completado exitosamente!")
  console.log("\n📋 Credenciales de acceso:")
  console.log("  Admin:    admin@devtrack.com         / password123")
  console.log("  Admin:    loritox3421@gmail.com      / podereterno1")
  console.log("  Mentor 1: carlos@devtrack.com  / password123")
  console.log("  Mentor 2: laura@devtrack.com   / password123")
  console.log("  Intern:   maria@devtrack.com   / password123")
  console.log("  Intern:   alex@devtrack.com    / password123")
  console.log("  Intern:   sofia@devtrack.com   / password123")
  console.log("  Intern:   diego@devtrack.com   / password123")
  console.log("  Intern:   valentina@devtrack.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
