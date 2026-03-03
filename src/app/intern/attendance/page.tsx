import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AttendanceMiniCalendar from "@/components/intern/AttendanceMiniCalendar"
import { calculateAttendanceRate } from "@/lib/scoring"
import StatCard from "@/components/intern/StatCard"
import { Clock, CheckCircle, AlertTriangle } from "lucide-react"

export default async function InternAttendancePage() {
  const session = await auth()
  if (!session?.user?.internId) redirect("/login")

  const records = await prisma.attendanceRecord.findMany({
    where: { internId: session.user.internId },
    orderBy: { date: "asc" },
  })

  const rate = calculateAttendanceRate(records.map((r: { status: string }) => r.status))
  const lateCount = records.filter((r: { status: string }) => r.status === "LATE").length
  const presentCount = records.filter((r: { status: string }) => r.status === "PRESENT" || r.status === "LATE").length

  const calendarRecords = records.map((r: { status: string; date: Date }) => ({
    date: r.date.toISOString().split("T")[0],
    status: r.status as "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED_ABSENCE" | "HOLIDAY",
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mi Asistencia</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Registro completo de tu asistencia durante la práctica
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Tasa de Asistencia"
          value={`${rate}%`}
          icon={<Clock className="h-5 w-5" />}
          color="neon"
        />
        <StatCard
          label="Días Presente"
          value={String(presentCount)}
          icon={<CheckCircle className="h-5 w-5" />}
          color="electric"
        />
        <StatCard
          label="Retardos"
          value={String(lateCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="amber"
        />
      </div>

      <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Calendario
        </h3>
        <AttendanceMiniCalendar records={calendarRecords} />
      </div>
    </div>
  )
}
