"use client"

import Avatar from "@/components/ui/Avatar"

interface ClockInRowProps {
  intern: { id: string; name: string; code: string; image?: string | null }
  row?: {
    status: string
    checkIn: string
    checkOut: string
    notes: string
    hoursWorked: number | null
    lateMinutes: number
    saved: boolean
  }
  onChange: (partial: Record<string, unknown>) => void
}

const statusOptions = [
  { value: "PRESENT", label: "Presente", className: "bg-neon-500/15 text-neon-400" },
  { value: "LATE", label: "Tardanza", className: "bg-amber-500/15 text-amber-400" },
  { value: "ABSENT", label: "Ausente", className: "bg-danger-500/15 text-danger-400" },
  { value: "JUSTIFIED_ABSENCE", label: "Justificado", className: "bg-violet-500/15 text-violet-400" },
  { value: "HOLIDAY", label: "Feriado", className: "bg-base-600 text-text-tertiary" },
]

const lateThreshold = parseInt(process.env.NEXT_PUBLIC_LATE_THRESHOLD_MINUTES || "15")
const minHours = parseInt(process.env.NEXT_PUBLIC_MIN_HOURS_PER_DAY || "6")

export default function ClockInRow({ intern, row, onChange }: ClockInRowProps) {
  if (!row) return null

  const handleStatusChange = (status: string) => {
    onChange({ status })
  }

  const handleCheckInChange = (checkIn: string) => {
    onChange({ checkIn })
    // Suggest LATE status if applicable
    if (checkIn && row.status === "PRESENT") {
      const [h, m] = checkIn.split(":").map(Number)
      const [sh, sm] = (process.env.NEXT_PUBLIC_WORK_HOURS_START || "09:00").split(":").map(Number)
      const late = (h * 60 + m) - (sh * 60 + sm)
      if (late > lateThreshold) {
        onChange({ checkIn, status: "LATE" })
      }
    }
  }

  return (
    <tr className={`border-b border-base-600/50 hover:bg-base-700 transition-colors duration-100 ${!row.saved ? "bg-base-700/30" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={intern.name} image={intern.image} size="sm" />
          <div>
            <p className="text-sm font-medium text-text-primary">{intern.name}</p>
            <p className="font-mono text-xs text-text-code">{intern.code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-electric-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {row.lateMinutes > lateThreshold && (
          <span className="ml-2 text-xs text-amber-400 font-mono">⚠ {row.lateMinutes} min</span>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="time"
          value={row.checkIn}
          onChange={(e) => handleCheckInChange(e.target.value)}
          className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-electric-500"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="time"
          value={row.checkOut}
          onChange={(e) => onChange({ checkOut: e.target.value })}
          className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-electric-500"
        />
      </td>
      <td className="px-4 py-3">
        {row.hoursWorked !== null ? (
          <span className={`font-mono text-sm ${row.hoursWorked < minHours ? "text-danger-400" : "text-neon-400"}`}>
            {row.hoursWorked.toFixed(1)}h
          </span>
        ) : (
          <span className="text-text-tertiary text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={row.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Notas..."
          className="bg-base-700 border border-base-600 text-text-primary rounded-lg px-2 py-1.5 text-xs outline-none focus:border-electric-500 w-full max-w-50"
        />
      </td>
    </tr>
  )
}
