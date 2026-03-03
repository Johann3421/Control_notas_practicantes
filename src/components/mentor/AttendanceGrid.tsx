"use client"

import Button from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react"

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

interface AttendanceGridProps {
  date: string
  onDateChange: (date: string) => void
  rows: InternRow[]
  onRowChange: (internId: string, updates: Partial<InternRow>) => void
  onSave: () => Promise<void>
  unsavedCount: number
  saving: boolean
  loading: boolean
}

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Presente" },
  { value: "LATE", label: "Tardanza" },
  { value: "ABSENT", label: "Ausente" },
  { value: "JUSTIFIED_ABSENCE", label: "Justificado" },
  { value: "HOLIDAY", label: "Feriado" },
]

const statusColor: Record<string, string> = {
  PRESENT: "text-neon-400",
  LATE: "text-amber-400",
  ABSENT: "text-danger-400",
  JUSTIFIED_ABSENCE: "text-violet-400",
  HOLIDAY: "text-base-400",
}

export default function AttendanceGrid({
  date, onDateChange, rows, onRowChange, onSave, unsavedCount, saving, loading,
}: AttendanceGridProps) {
  const navigateDate = (direction: number) => {
    const [y, m, d] = date.split("-").map(Number)
    const nd = new Date(y, m - 1, d + direction)
    onDateChange(`${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`)
  }

  const isToday = (() => {
    const n = new Date()
    return date === `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`
  })()

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateDate(-1)} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-base-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <span className="font-mono text-sm text-text-code">
              {(() => { const [y,m,d] = date.split("-").map(Number); return new Date(y, m-1, d).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) })()}
            </span>
            {isToday && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-electric-500/15 text-electric-400 font-mono text-xs border border-electric-500/30">
                HOY
              </span>
            )}
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-base-700 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <Button onClick={onSave} disabled={unsavedCount === 0 || saving} size="md">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar{unsavedCount > 0 ? ` (${unsavedCount})` : ""}
        </Button>
      </div>

      {/* Grid */}
      <div className="bg-base-800 border border-base-600 rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
            <span className="ml-2 text-sm text-text-tertiary">Cargando asistencia...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-tertiary">
            No hay practicantes registrados para esta fecha.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base-600">
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Practicante</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Estado</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Entrada</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Salida</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Notas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.internId}
                    className={`border-b border-base-700 hover:bg-base-750 transition-colors ${!row.saved ? "bg-base-800/50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{row.internName}</p>
                        <p className="font-mono text-xs text-text-code">{row.internCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status ?? "PRESENT"}
                        onChange={(e) => onRowChange(row.internId, { status: e.target.value })}
                        className={`bg-base-700 border border-base-600 rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-electric-500 ${statusColor[row.status] || "text-text-primary"}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.clockIn ?? ""}
                        onChange={(e) => {
                          const clockIn = e.target.value
                          const updates: Partial<InternRow> = { clockIn }
                          // Auto-calculate hours worked
                          if (clockIn && row.clockOut) {
                            const [ih, im] = clockIn.split(":").map(Number)
                            const [oh, om] = row.clockOut.split(":").map(Number)
                            const diff = (oh * 60 + om - ih * 60 - im) / 60
                            if (diff > 0) updates.hoursWorked = Math.round(diff * 100) / 100
                          }
                          // Auto-calculate late minutes (standard start 09:00)
                          if (clockIn && row.status === "LATE") {
                            const [ih, im] = clockIn.split(":").map(Number)
                            const late = ih * 60 + im - 9 * 60
                            updates.lateMinutes = late > 0 ? late : 0
                          }
                          onRowChange(row.internId, updates)
                        }}
                        className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-electric-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.clockOut ?? ""}
                        onChange={(e) => {
                          const clockOut = e.target.value
                          const updates: Partial<InternRow> = { clockOut }
                          // Auto-calculate hours worked
                          if (row.clockIn && clockOut) {
                            const [ih, im] = row.clockIn.split(":").map(Number)
                            const [oh, om] = clockOut.split(":").map(Number)
                            const diff = (oh * 60 + om - ih * 60 - im) / 60
                            if (diff > 0) updates.hoursWorked = Math.round(diff * 100) / 100
                          }
                          onRowChange(row.internId, updates)
                        }}
                        className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-electric-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.notes ?? ""}
                        onChange={(e) => onRowChange(row.internId, { notes: e.target.value })}
                        placeholder="Notas..."
                        className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs outline-none focus:border-electric-500 w-full max-w-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
