import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["FEATURE", "BUG", "LEARNING", "CODE_REVIEW", "DOCUMENTATION", "MEETING"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  internId: z.string().min(1, "Practicante requerido"),
  goalId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
})

export const taskUpdateSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]).optional(),
  feedback: z.string().optional(),
  score: z.number().int().min(1).max(5).optional(),
  actualHours: z.number().positive().optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
})

export type TaskFormValues = z.infer<typeof taskSchema>
export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>
