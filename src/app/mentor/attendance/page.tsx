"use client"

import { useState, useEffect, useCallback } from "react"
import AttendanceGrid from "@/components/mentor/AttendanceGrid"
import { toast } from "sonner"

interface InternRow {
  internId: string
  internName: string
  internCode: string
  status: string
  clockIn: string
  clockOut: string
  lateMinutes: number
  hoursWorked: number
  notes: string
  saved: boolean
}

export default function MentorAttendancePage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [rows, setRows] = useState<InternRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/attendance?date=${date}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRows(data.rows ?? [])
    } catch {
      toast.error("Error al cargar asistencia")
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const unsaved = rows.filter((r) => !r.saved)
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records: unsaved }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${unsaved.length} registro(s) guardado(s)`)
      fetchData()
    } catch {
      toast.error("Error al guardar asistencia")
    } finally {
      setSaving(false)
    }
  }

  const handleRowChange = (internId: string, updates: Partial<InternRow>) => {
    setRows((prev) =>
      prev.map((r) =>
        r.internId === internId ? { ...r, ...updates, saved: false } : r
      )
    )
  }

  const unsavedCount = rows.filter((r) => !r.saved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Asistencia</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Registro diario de asistencia del equipo
          </p>
        </div>
      </div>

      <AttendanceGrid
        date={date}
        onDateChange={setDate}
        rows={rows}
        onRowChange={handleRowChange}
        onSave={handleSave}
        unsavedCount={unsavedCount}
        saving={saving}
        loading={loading}
      />
    </div>
  )
}
