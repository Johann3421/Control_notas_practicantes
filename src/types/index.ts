import type { 
  Role, InternStatus, PromotionStatus, AttendanceStatus,
  GoalCategory, GoalStatus, GoalPriority,
  TaskType, TaskPriority, TaskStatus 
} from "@/generated/prisma/client"

export type {
  Role, InternStatus, PromotionStatus, AttendanceStatus,
  GoalCategory, GoalStatus, GoalPriority,
  TaskType, TaskPriority, TaskStatus
}

// Session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
      internId: string | null
      image?: string | null
    }
  }

  interface User {
    role: Role
    internProfile?: { id: string } | null
  }
}

// Scoring types
export interface SkillItem {
  label: string
  description: string
  score: number
}

export interface SkillsData {
  tech: SkillItem[]
  soft: SkillItem[]
}

export interface TechScores {
  codeQuality: number
  problemSolving: number
  gitUsage: number
  tooling: number
  codeReview: number
  architecture: number
}

export interface SoftScores {
  communication: number
  teamwork: number
  initiative: number
  timeManagement: number
  adaptability: number
  documentation: number
}

export interface WeeklyAverages {
  techAverage: number
  softAverage: number
  overallAverage: number
}

// Component prop types
export interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: { value: number; label: string }
  color: "electric" | "neon" | "amber" | "danger" | "violet"
  icon: React.ReactNode
  subtitle?: string
}

export interface SkillNode {
  id: string
  title: string
  technology?: string | null
  status: GoalStatus
  position: [number, number, number]
  connections: string[]
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Evaluation form data
export interface EvaluationFormData extends TechScores, SoftScores {
  internId: string
  weekNumber: number
  weekStart: string
  weekEnd: string
  strengths: string
  improvements: string
  goals: string
  relatedGoals: Array<{ goalId: string; progressNote: string }>
}

// Attendance form data
export interface AttendanceFormData {
  internId: string
  date: string
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
  notes?: string
}

// Task form data
export interface TaskFormData {
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  internId: string
  goalId?: string
  dueDate?: string
  estimatedHours?: number
  repositoryUrl?: string
}
