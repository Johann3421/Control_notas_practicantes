import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import TeamOverviewTable from "@/components/mentor/TeamOverviewTable"
import StatCard from "@/components/intern/StatCard"
import { calculateAttendanceRate } from "@/lib/scoring"
import { Users, BarChart3, Clock, CheckCircle } from "lucide-react"

export default async function MentorDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const interns = await prisma.intern.findMany({
    where: { mentorId: session.user.id },
    include: {
      user: true,
      evaluations: {
        orderBy: { weekNumber: "desc" },
        take: 2,
      },
      attendance: {
        orderBy: { date: "desc" },
      },
      tasks: true,
    },
    orderBy: { user: { name: "asc" } },
  })

  const totalInterns = interns.length
  const avgScore =
    totalInterns > 0
      ? (interns.reduce((acc: number, i: { overallScore: unknown }) => acc + Number(i.overallScore), 0) / totalInterns).toFixed(1)
      : "0.0"

  const allAttendance = interns.flatMap((i: { attendance: { status: string }[] }) => i.attendance.map((a: { status: string }) => a.status))
  const avgAttendance = allAttendance.length > 0 ? calculateAttendanceRate(allAttendance) : 0

  const allTasks = interns.flatMap((i: { tasks: { status: string }[] }) => i.tasks)
  const completedTasks = allTasks.filter((t: { status: string }) => t.status === "DONE").length

  const tableData = interns.map((intern) => {
    const latest = intern.evaluations[0]
    const prev = intern.evaluations[1]
    const attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
    const activeTasks = intern.tasks.filter((t: { status: string }) => t.status === "TODO" || t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length

    return {
      id: intern.id,
      name: intern.user.name ?? "—",
      email: intern.user.email ?? "",
      image: intern.user.image,
      code: intern.code,
      stack: intern.stack,
      status: intern.status,
      overallScore: Number(intern.overallScore),
      attendanceRate,
      currentWeek: intern.currentWeek ?? (intern.evaluations.length || 1),
      totalWeeks: intern.totalWeeks,
      latestScore: latest ? Number(latest.overallAverage) : 0,
      activeTasks,
      trend:
        latest && prev
          ? Number(latest.overallAverage) > Number(prev.overallAverage)
            ? ("up" as const)
            : Number(latest.overallAverage) < Number(prev.overallAverage)
            ? ("down" as const)
            : ("stable" as const)
          : ("stable" as const),
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Panel de Mentor</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Vista general de tu equipo de practicantes
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Practicantes"
          value={String(totalInterns)}
          icon={<Users className="h-5 w-5" />}
          color="electric"
        />
        <StatCard
          label="Score Promedio"
          value={avgScore}
          icon={<BarChart3 className="h-5 w-5" />}
          color="neon"
        />
        <StatCard
          label="Asistencia Prom."
          value={`${avgAttendance}%`}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          label="Tareas Completadas"
          value={`${completedTasks}/${allTasks.length}`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="violet"
        />
      </div>

      <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Equipo
        </h3>
        {tableData.length > 0 ? (
          <TeamOverviewTable interns={tableData} />
        ) : (
          <p className="py-8 text-center text-sm text-text-tertiary">
            No tienes practicantes asignados.
          </p>
        )}
      </div>
    </div>
  )
}
