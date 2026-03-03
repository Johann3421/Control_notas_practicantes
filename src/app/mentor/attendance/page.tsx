"use client"

import { useState, useEffect, useCallback } from "react"
import AttendanceGrid from "@/components/mentor/AttendanceGrid"
import { toast } from "sonner"
import { AlertTriangle, Wrench, Loader2 } from "lucide-react"

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

const FIX_APPLIED_KEY = "attendance_date_fix_applied_v1"

export default function MentorAttendancePage() {
  const [date, setDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })
  const [rows, setRows] = useState<InternRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showFixBanner, setShowFixBanner] = useState(false)
  const [fixing, setFixing] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const applied = localStorage.getItem(FIX_APPLIED_KEY)
      if (!applied) setShowFixBanner(true)
    }
  }, [])

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

  const handleFixDates = async () => {
    if (!confirm("¿Corregir todas las fechas de asistencia? Esto moverá cada registro 1 día hacia atrás para compensar el error de zona horaria. Esta acción no se puede deshacer.")) return
    setFixing(true)
    try {
      const res = await fetch("/api/attendance/fix-dates?confirm=yes", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✅ ${data.message}`)
      localStorage.setItem(FIX_APPLIED_KEY, "1")
      setShowFixBanner(false)
      fetchData()
    } catch (e: unknown) {
      toast.error(`Error al corregir: ${e instanceof Error ? e.message : "desconocido"}`)
    } finally {
      setFixing(false)
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

      {showFixBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-300">Corrección de fechas pendiente</p>
            <p className="mt-1 text-xs text-amber-400/80">
              Los registros guardados anteriormente tienen las fechas desplazadas 1 día por un error de zona horaria.
              Ejecuta la corrección para que los practicantes vean sus asistencias en los días correctos.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { localStorage.setItem(FIX_APPLIED_KEY, "1"); setShowFixBanner(false) }}
              className="text-xs text-amber-500/60 hover:text-amber-400 transition-colors"
            >
              Ignorar
            </button>
            <button
              onClick={handleFixDates}
              disabled={fixing}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {fixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
              {fixing ? "Corrigiendo..." : "Corregir fechas"}
            </button>
          </div>
        </div>
      )}

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
