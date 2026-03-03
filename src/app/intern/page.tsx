import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StatCard from "@/components/intern/StatCard"
import WeeklyScoreChart from "@/components/intern/WeeklyScoreChart"
import SkillRadarChart from "@/components/intern/SkillRadarChart"
import FeedbackCard from "@/components/intern/FeedbackCard"
import TaskCard from "@/components/intern/TaskCard"
import { calculateAttendanceRate } from "@/lib/scoring"
import { BarChart3, Target, Clock, TrendingUp } from "lucide-react"

export default async function InternDashboard() {
  const session = await auth()
  if (!session?.user?.internId) redirect("/login")

  const internId = session.user.internId

  const [intern, evaluations, tasks, attendance] = await Promise.all([
    prisma.intern.findUnique({
      where: { id: internId },
      include: { user: true },
    }),
    prisma.weeklyEvaluation.findMany({
      where: { internId },
      orderBy: { weekNumber: "asc" },
      include: { relatedGoals: { include: { goal: true } } },
    }),
    prisma.task.findMany({
      where: { internId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.attendanceRecord.findMany({
      where: { internId },
      orderBy: { date: "desc" },
    }),
  ])

  if (!intern) redirect("/login")

  const attendanceRate = calculateAttendanceRate(
    attendance.map((a: { status: string }) => a.status)
  )

  const latestEval = evaluations[evaluations.length - 1]
  const prevEval = evaluations.length > 1 ? evaluations[evaluations.length - 2] : null

  const weeklyData = evaluations.map((e) => ({
    week: `S${e.weekNumber}`,
    techAverage: Number(e.techAverage),
    softAverage: Number(e.softAverage),
    weeklyAverage: Number(e.overallAverage),
  }))

  const currentSkills = latestEval
    ? {
        "Código": Number(latestEval.codeQuality),
        "Resolución": Number(latestEval.problemSolving),
        "Git": Number(latestEval.gitUsage),
        "Comunicación": Number(latestEval.communication),
        "Trabajo en equipo": Number(latestEval.teamwork),
        "Iniciativa": Number(latestEval.initiative),
      }
    : null

  const previousSkills = prevEval
    ? {
        "Código": Number(prevEval.codeQuality),
        "Resolución": Number(prevEval.problemSolving),
        "Git": Number(prevEval.gitUsage),
        "Comunicación": Number(prevEval.communication),
        "Trabajo en equipo": Number(prevEval.teamwork),
        "Iniciativa": Number(prevEval.initiative),
      }
    : undefined

  const weekProgress = intern.currentWeek ?? evaluations.length
  const totalWeeks = parseInt(process.env.NEXT_PUBLIC_INTERNSHIP_WEEKS ?? "12")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Bienvenido, {intern.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Semana {weekProgress} de {totalWeeks} — Tu progreso en tiempo real
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Score General"
          value={Number(intern.overallScore).toFixed(1)}
          icon={<BarChart3 className="h-5 w-5" />}
          color="electric"
          trend={
            prevEval && latestEval
              ? {
                  value: Number(latestEval.overallAverage) - Number(prevEval.overallAverage),
                  label: Number(latestEval.overallAverage) > Number(prevEval.overallAverage)
                    ? "Mejora vs semana anterior"
                    : Number(latestEval.overallAverage) < Number(prevEval.overallAverage)
                    ? "Baja vs semana anterior"
                    : "Sin cambio",
                }
              : undefined
          }
        />
        <StatCard
          label="Asistencia"
          value={`${attendanceRate}%`}
          icon={<Clock className="h-5 w-5" />}
          color="neon"
        />
        <StatCard
          label="Tareas Completadas"
          value={`${tasks.filter((t: { status: string }) => t.status === "DONE").length}/${tasks.length}`}
          icon={<Target className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          label="Semana Actual"
          value={`${weekProgress}/${totalWeeks}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="violet"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Evolución Semanal
          </h3>
          {weeklyData.length > 0 ? (
            <WeeklyScoreChart data={weeklyData} />
          ) : (
            <p className="py-12 text-center text-sm text-text-tertiary">
              Aún no hay evaluaciones registradas.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Radar de Habilidades
          </h3>
          {currentSkills ? (
            <SkillRadarChart current={currentSkills} previous={previousSkills} />
          ) : (
            <p className="py-12 text-center text-sm text-text-tertiary">
              Aún no hay datos de habilidades.
            </p>
          )}
        </div>
      </div>

      {/* Recent Feedback & Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Último Feedback
          </h3>
          {latestEval ? (
            <FeedbackCard evaluation={{
              weekNumber: latestEval.weekNumber,
              weekStart: latestEval.weekStart.toISOString().split('T')[0],
              weekEnd: latestEval.weekEnd.toISOString().split('T')[0],
              overallAverage: Number(latestEval.overallAverage),
              techAverage: Number(latestEval.techAverage),
              softAverage: Number(latestEval.softAverage),
              strengths: latestEval.strengths,
              improvements: latestEval.improvements,
              goals: latestEval.goals,
            }} />
          ) : (
            <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
              <p className="text-sm text-text-tertiary">Sin feedback disponible.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Tareas Recientes
          </h3>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={{
                  title: task.title,
                  type: task.type,
                  status: task.status,
                  priority: task.priority,
                  dueDate: task.dueDate?.toISOString().split('T')[0] ?? null,
                  score: task.score,
                  repositoryUrl: task.repositoryUrl,
                }} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
              <p className="text-sm text-text-tertiary">No hay tareas asignadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
