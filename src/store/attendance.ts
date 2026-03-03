import { create } from "zustand"
import type { AttendanceStatus } from "@/types"

interface AttendanceRow {
  internId: string
  internName: string
  internCode: string
  status: AttendanceStatus
  checkIn: string
  checkOut: string
  notes: string
  hoursWorked: number | null
  lateMinutes: number
  saved: boolean
}

interface AttendanceStore {
  date: string
  rows: Record<string, AttendanceRow>
  setDate: (date: string) => void
  setRow: (internId: string, row: Partial<AttendanceRow>) => void
  initRow: (internId: string, row: AttendanceRow) => void
  markSaved: (internId: string) => void
  markAllSaved: () => void
  reset: () => void
}

function calculateLateMinutes(checkIn: string): number {
  if (!checkIn) return 0
  const workStart = process.env.NEXT_PUBLIC_WORK_HOURS_START || "09:00"
  const [startH, startM] = workStart.split(":").map(Number)
  const [checkH, checkM] = checkIn.split(":").map(Number)
  const diff = (checkH * 60 + checkM) - (startH * 60 + startM)
  return Math.max(0, diff)
}

function calculateHoursWorked(checkIn: string, checkOut: string): number | null {
  if (!checkIn || !checkOut) return null
  const [inH, inM] = checkIn.split(":").map(Number)
  const [outH, outM] = checkOut.split(":").map(Number)
  const hours = (outH * 60 + outM - inH * 60 - inM) / 60
  return Math.round(hours * 100) / 100
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  date: new Date().toISOString().split("T")[0],
  rows: {},
  setDate: (date) => set({ date, rows: {} }),
  initRow: (internId, row) =>
    set((state) => ({
      rows: { ...state.rows, [internId]: row },
    })),
  setRow: (internId, partial) =>
    set((state) => {
      const current = state.rows[internId]
      if (!current) return state
      const updated = { ...current, ...partial, saved: false }
      
      // Recalculate derived values
      if (partial.checkIn !== undefined || partial.checkOut !== undefined) {
        const checkIn = partial.checkIn ?? current.checkIn
        const checkOut = partial.checkOut ?? current.checkOut
        updated.lateMinutes = calculateLateMinutes(checkIn)
        updated.hoursWorked = calculateHoursWorked(checkIn, checkOut)
      }

      return { rows: { ...state.rows, [internId]: updated } }
    }),
  markSaved: (internId) =>
    set((state) => {
      const current = state.rows[internId]
      if (!current) return state
      return { rows: { ...state.rows, [internId]: { ...current, saved: true } } }
    }),
  markAllSaved: () =>
    set((state) => {
      const rows = { ...state.rows }
      for (const key of Object.keys(rows)) {
        rows[key] = { ...rows[key], saved: true }
      }
      return { rows }
    }),
  reset: () => set({ rows: {} }),
}))
