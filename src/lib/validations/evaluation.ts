import { z } from "zod"

const scoreField = z.number().int().min(0, "Mínimo 0").max(20, "Máximo 20")

export const evaluationSchema = z.object({
  internId: z.string().min(1, "Practicante requerido"),
  weekNumber: z.number().int().min(1).max(52),
  weekStart: z.string().min(1, "Fecha de inicio requerida"),
  weekEnd: z.string().min(1, "Fecha de fin requerida"),

  // Technical skills
  codeQuality: scoreField,
  logicSolving: scoreField,
  stackKnowledge: scoreField,
  testing: scoreField,
  gitWorkflow: scoreField,
  documentation: scoreField,

  // Soft skills
  communication: scoreField,
  proactivity: scoreField,
  teamwork: scoreField,
  timeManagement: scoreField,
  learningSpeed: scoreField,
  professionalConduct: scoreField,

  // Feedback
  strengths: z.string().min(10, "Mínimo 10 caracteres"),
  improvements: z.string().min(10, "Mínimo 10 caracteres"),
  goals: z.string().min(10, "Mínimo 10 caracteres"),

  // Related goals
  relatedGoals: z.array(z.object({
    goalId: z.string(),
    progressNote: z.string().optional(),
  })).optional(),
})

export type EvaluationFormValues = z.infer<typeof evaluationSchema>
