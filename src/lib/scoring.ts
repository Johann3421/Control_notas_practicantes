import type { TechScores, SoftScores, WeeklyAverages } from "@/types"

const TECH_WEIGHT = 0.60
const SOFT_WEIGHT = 0.40

export function calculateWeeklyAverages(tech: TechScores, soft: SoftScores): WeeklyAverages {
  const techScores = [
    tech.codeQuality, tech.problemSolving, tech.gitUsage,
    tech.tooling, tech.codeReview, tech.architecture,
  ]
  const softScores = [
    soft.communication, soft.teamwork, soft.initiative,
    soft.timeManagement, soft.adaptability, soft.documentation,
  ]

  const techAvg = techScores.reduce((a, b) => a + b, 0) / techScores.length
  const softAvg = softScores.reduce((a, b) => a + b, 0) / softScores.length
  const overallAvg = techAvg * TECH_WEIGHT + softAvg * SOFT_WEIGHT

  return {
    techAverage: Math.round(techAvg * 100) / 100,
    softAverage: Math.round(softAvg * 100) / 100,
    overallAverage: Math.round(overallAvg * 100) / 100,
  }
}

export function scoreToLabel(score: number): string {
  if (score >= 18) return "Excepcional"
  if (score >= 14) return "Por encima del estándar"
  if (score >= 10) return "Cumple el estándar"
  if (score >= 6)  return "Por debajo del estándar"
  return "Necesita atención urgente"
}

export function scoreToColor(score: number): string {
  if (score >= 18) return "neon"
  if (score >= 14) return "electric"
  if (score >= 10) return "amber"
  return "danger"
}

export interface AttendanceRecordForCalc {
  status: string
}

export function calculateAttendanceRate(statuses: string[]): number {
  if (statuses.length === 0) return 0
  const present = statuses.filter((s) =>
    s === "PRESENT" || s === "LATE"
  ).length
  return Math.round((present / statuses.length) * 100)
}

export interface EvaluationForCalc {
  overallAverage: number | { toNumber?: () => number } | string
}

export function calculateOverallScore(evaluations: EvaluationForCalc[]): number {
  if (evaluations.length === 0) return 0
  const total = evaluations.reduce((sum, e) => {
    const val = typeof e.overallAverage === "object" && e.overallAverage !== null
      ? (e.overallAverage as { toNumber: () => number }).toNumber?.() ?? Number(e.overallAverage)
      : Number(e.overallAverage)
    return sum + val
  }, 0)
  return Math.round((total / evaluations.length) * 100) / 100
}

export type PromotionResult = "PROMOTED" | "GRADUATED" | "EXTENDED" | "NOT_RECOMMENDED"

export function getPromotionRecommendation(
  overallScore: number,
  attendanceRate: number,
  taskCompletion: number
): PromotionResult {
  if (overallScore >= 16 && attendanceRate >= 90 && taskCompletion >= 85) {
    return "PROMOTED"
  }
  if (overallScore >= 12 && attendanceRate >= 75 && taskCompletion >= 60) {
    return "GRADUATED"
  }
  if (overallScore >= 10 && attendanceRate >= 70) {
    return "EXTENDED"
  }
  return "NOT_RECOMMENDED"
}

export function promotionLabel(status: string): string {
  const labels: Record<string, string> = {
    PROMOTED: "Promovido",
    GRADUATED: "Graduado",
    EXTENDED: "Extender prácticas",
    NOT_RECOMMENDED: "No recomendado",
  }
  return labels[status] || status
}

export function promotionColor(status: string): string {
  const colors: Record<string, string> = {
    PROMOTED: "neon",
    GRADUATED: "electric",
    EXTENDED: "amber",
    NOT_RECOMMENDED: "danger",
  }
  return colors[status] || "danger"
}

export const TECH_SKILLS = [
  { key: "codeQuality", label: "Calidad de código", description: "Naming, estructura, principios SOLID, DRY, legibilidad" },
  { key: "problemSolving", label: "Resolución de problemas", description: "Algoritmos, estructuras de datos, enfoque de soluciones" },
  { key: "gitUsage", label: "Uso de Git", description: "Commits atómicos, mensajes descriptivos, branching, PRs" },
  { key: "tooling", label: "Herramientas", description: "IDE, linters, debuggers, CI/CD" },
  { key: "codeReview", label: "Code Review", description: "Capacidad de dar y recibir feedback en PRs" },
  { key: "architecture", label: "Arquitectura", description: "Diseño de componentes, patrones, separación de responsabilidades" },
] as const

export const SOFT_SKILLS = [
  { key: "communication", label: "Comunicación", description: "Claridad al comunicar avances y bloqueos" },
  { key: "teamwork", label: "Trabajo en equipo", description: "Colaboración con el equipo" },
  { key: "initiative", label: "Iniciativa", description: "Proactividad y autonomía" },
  { key: "timeManagement", label: "Gestión del tiempo", description: "Cumplimiento de tiempos y estimaciones" },
  { key: "adaptability", label: "Adaptabilidad", description: "Velocidad de asimilación de nuevos conceptos" },
  { key: "documentation", label: "Documentación", description: "README, JSDoc, comentarios útiles" },
] as const
