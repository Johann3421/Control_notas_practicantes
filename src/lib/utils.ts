import { clsx, type ClassValue } from "clsx"

// Simplified cn utility (no tailwind-merge needed with v4)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string, locale = "es-ES"): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function scoreToColor(score: number): string {
  if (score >= 18) return "neon"
  if (score >= 14) return "electric"
  if (score >= 10) return "amber"
  return "danger"
}

export function scoreToColorClass(score: number): string {
  if (score >= 18) return "text-neon-400"
  if (score >= 14) return "text-electric-400"
  if (score >= 10) return "text-amber-400"
  return "text-danger-400"
}

export function scoreToLabel(score: number): string {
  if (score >= 18) return "Excepcional"
  if (score >= 14) return "Por encima del estándar"
  if (score >= 10) return "Cumple el estándar"
  if (score >= 6)  return "Por debajo del estándar"
  return "Necesita atención urgente"
}

export function scoreToBgClass(score: number): string {
  if (score >= 18) return "bg-neon-500/15 text-neon-400 border-neon-500/30"
  if (score >= 14) return "bg-electric-500/15 text-electric-400 border-electric-500/30"
  if (score >= 10) return "bg-amber-500/15 text-amber-400 border-amber-500/30"
  return "bg-danger-500/15 text-danger-400 border-danger-500/30"
}

export function weekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

export function getWeekRange(weekNum: number, year: number): { start: Date; end: Date } {
  const jan1 = new Date(year, 0, 1)
  const daysOffset = (weekNum - 1) * 7 - jan1.getDay() + 1
  const start = new Date(year, 0, 1 + daysOffset)
  const end = new Date(start)
  end.setDate(end.getDate() + 4) // Mon-Fri
  return { start, end }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function attendanceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PRESENT: "Presente",
    LATE: "Tardanza",
    ABSENT: "Ausente",
    JUSTIFIED_ABSENCE: "Justificado",
    HOLIDAY: "Feriado",
  }
  return labels[status] || status
}

export function attendanceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PRESENT: "bg-neon-500/15 text-neon-400 border-neon-500/30",
    LATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ABSENT: "bg-danger-500/15 text-danger-400 border-danger-500/30",
    JUSTIFIED_ABSENCE: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    HOLIDAY: "bg-base-600 text-text-tertiary border-base-500",
  }
  return colors[status] || "bg-base-600 text-text-tertiary border-base-500"
}

export function taskStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    TODO: "Por hacer",
    IN_PROGRESS: "En progreso",
    IN_REVIEW: "En revisión",
    DONE: "Completada",
    BLOCKED: "Bloqueada",
  }
  return labels[status] || status
}

export function taskStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: "bg-base-600 text-text-secondary border-base-500",
    IN_PROGRESS: "bg-electric-500/15 text-electric-400 border-electric-500/30",
    IN_REVIEW: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    DONE: "bg-neon-500/15 text-neon-400 border-neon-500/30",
    BLOCKED: "bg-danger-500/15 text-danger-400 border-danger-500/30",
  }
  return colors[status] || "bg-base-600 text-text-secondary border-base-500"
}

export function taskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FEATURE: "Feature",
    BUG: "Bug",
    LEARNING: "Aprendizaje",
    CODE_REVIEW: "Code Review",
    DOCUMENTATION: "Documentación",
    MEETING: "Reunión",
  }
  return labels[type] || type
}

export function goalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En progreso",
    COMPLETED: "Completado",
    SKIPPED: "Omitido",
  }
  return labels[status] || status
}
