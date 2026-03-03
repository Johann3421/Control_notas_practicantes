"use client"

interface AttendanceMiniCalendarProps {
  records: Array<{
    date: string
    status: string
    hoursWorked?: number | null
    lateMinutes?: number
    notes?: string | null
  }>
  startDate?: string
  endDate?: string
}

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

const statusDotColor: Record<string, string> = {
  PRESENT: "bg-neon-500",
  LATE: "bg-amber-500",
  ABSENT: "bg-danger-500",
  JUSTIFIED_ABSENCE: "bg-violet-500",
  HOLIDAY: "bg-base-500",
}

export default function AttendanceMiniCalendar({
  records,
  startDate = records[0]?.date ?? new Date().toISOString().split('T')[0],
  endDate = records[records.length - 1]?.date ?? new Date().toISOString().split('T')[0],
}: AttendanceMiniCalendarProps) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const recordMap = new Map(records.map((r) => [r.date.split("T")[0], r]))

  // Generate months between start and end
  const months: Array<{ year: number; month: number }> = []
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  while (current <= end) {
    months.push({ year: current.getFullYear(), month: current.getMonth() })
    current.setMonth(current.getMonth() + 1)
  }

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"]

  return (
    <div className="space-y-6">
      {months.map(({ year, month }) => {
        const daysInMonth = getMonthDays(year, month)
        const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0

        return (
          <div key={`${year}-${month}`}>
            <h4 className="text-sm font-medium text-text-primary mb-2 capitalize">
              {new Date(year, month).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => (
                <span key={d} className="text-center text-xs text-text-tertiary font-mono py-1">{d}</span>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const record = recordMap.get(dateStr)
                const isWeekend = [5, 6].includes((new Date(year, month, day).getDay() + 6) % 7)

                return (
                  <div
                    key={day}
                    className={`relative flex items-center justify-center py-1.5 rounded text-xs font-mono ${
                      record ? "cursor-pointer hover:bg-base-700" : ""
                    } ${isWeekend ? "text-text-tertiary/50" : "text-text-secondary"}`}
                    title={record ? `${record.status}${record.hoursWorked ? ` · ${record.hoursWorked}h` : ""}${record.notes ? ` · ${record.notes}` : ""}` : ""}
                  >
                    {day}
                    {record && (
                      <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${statusDotColor[record.status] || "bg-base-500"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-base-600">
        {[
          { status: "PRESENT", label: "Presente", color: "bg-neon-500" },
          { status: "LATE", label: "Tardanza", color: "bg-amber-500" },
          { status: "ABSENT", label: "Ausente", color: "bg-danger-500" },
          { status: "JUSTIFIED_ABSENCE", label: "Justificado", color: "bg-violet-500" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-xs text-text-tertiary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
