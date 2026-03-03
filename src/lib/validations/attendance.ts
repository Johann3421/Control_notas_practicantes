import { z } from "zod"

export const attendanceSchema = z.object({
  internId: z.string().min(1, "Practicante requerido"),
  date: z.string().min(1, "Fecha requerida"),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "JUSTIFIED_ABSENCE", "HOLIDAY"]),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
})

export const bulkAttendanceSchema = z.object({
  date: z.string().min(1, "Fecha requerida"),
  records: z.array(attendanceSchema),
})

export type AttendanceFormValues = z.infer<typeof attendanceSchema>
export type BulkAttendanceFormValues = z.infer<typeof bulkAttendanceSchema>
