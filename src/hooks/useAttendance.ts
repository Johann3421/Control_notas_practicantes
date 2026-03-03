"use client"
import { useAttendanceStore } from "@/store/attendance"

export function useAttendance() {
  const store = useAttendanceStore()

  const unsavedCount = Object.values(store.rows).filter((r) => !r.saved).length
  const hasUnsaved = unsavedCount > 0

  const allRows = Object.entries(store.rows).map(([id, row]) => ({
    ...row,
    internId: id,
  }))

  return {
    ...store,
    unsavedCount,
    hasUnsaved,
    allRows,
  }
}
