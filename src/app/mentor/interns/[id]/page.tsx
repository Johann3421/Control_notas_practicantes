import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import InternProfileHeader from "@/components/mentor/InternProfileHeader"
import ReportSummary from "@/components/mentor/ReportSummary"
import ProgressionBadge from "@/components/mentor/ProgressionBadge"
import WeeklyScoreChart from "@/components/intern/WeeklyScoreChart"
import SkillRadarChart from "@/components/intern/SkillRadarChart"
import TaskCard from "@/components/intern/TaskCard"
import { calculateAttendanceRate, getPromotionRecommendation } from "@/lib/scoring"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { ArrowLeft, FileText, Target } from "lucide-react"

export default async function InternDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const intern = await prisma.intern.findUnique({
    where: { id },
    include: {
      user: true,
      evaluations: {
        orderBy: { weekNumber: "asc" },
        include: { relatedGoals: { include: { goal: true } } },
      },
      attendance: { orderBy: { date: "desc" } },
      tasks: { orderBy: { createdAt: "desc" }, take: 10 },
      learningGoals: true,
    },
  })

  if (!intern || intern.mentorId !== session.user.id) {
    notFound()
  }

  const attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
  const totalWeeks = parseInt(process.env.NEXT_PUBLIC_INTERNSHIP_WEEKS ?? "12")
  const weekProgress = intern.currentWeek ?? intern.evaluations.length

  const weeklyData = intern.evaluations.map((e: { weekNumber: number; techAverage: unknown; softAverage: unknown; overallAverage: unknown }) => ({
    week: `S${e.weekNumber}`,
    techAverage: Number(e.techAverage),
    softAverage: Number(e.softAverage),
    weeklyAverage: Number(e.overallAverage),
  }))

  const latestEval = intern.evaluations[intern.evaluations.length - 1]
  const prevEval = intern.evaluations.length > 1 ? intern.evaluations[intern.evaluations.length - 2] : null

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

  const goalsCompleted = intern.learningGoals.filter((g: { status: string }) => g.status === "COMPLETED").length
  const tasksCompleted = intern.tasks.filter((t: { status: string }) => t.status === "DONE").length
  const taskCompletion = intern.tasks.length > 0 ? Math.round((tasksCompleted / intern.tasks.length) * 100) : 0

  const autoPromotion = getPromotionRecommendation(
    Number(intern.overallScore),
    attendanceRate,
    taskCompletion
  )
  // Use manual override from DB if set, otherwise fall back to auto-calculated
  const promotion = (intern.promotionRecommendation as string | null) ?? autoPromotion

  const kpis = [
    { label: "Score General", value: Number(intern.overallScore).toFixed(1), max: "20.0" },
    { label: "Asistencia", value: `${attendanceRate}%`, max: "100%" },
    { label: "Tareas", value: `${tasksCompleted}/${intern.tasks.length}`, max: "" },
    { label: "Objetivos", value: `${goalsCompleted}/${intern.learningGoals.length}`, max: "" },
    { label: "Semanas", value: `${weekProgress}/${totalWeeks}`, max: "" },
    { label: "Recomendación", value: promotion, max: "" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/interns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div className="flex-1" />
        <Link href={`/mentor/interns/${id}/goals`}>
          <Button variant="secondary" size="sm">
            <Target className="h-4 w-4" />
            Objetivos
          </Button>
        </Link>
        <Link href={`/mentor/interns/${id}/report`}>
          <Button variant="secondary" size="sm">
            <FileText className="h-4 w-4" />
            Reporte
          </Button>
        </Link>
      </div>

      <InternProfileHeader
        name={intern.user.name ?? ""}
        email={intern.user.email ?? ""}
        image={intern.user.image}
        code={intern.code}
        stack={intern.stack}
        university={intern.university ?? undefined}
        status={intern.status}
        overallScore={Number(intern.overallScore)}
        weekProgress={weekProgress}
        totalWeeks={totalWeeks}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ReportSummary kpis={kpis} />

          <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Evolución Semanal
            </h3>
            {weeklyData.length > 0 ? (
              <WeeklyScoreChart data={weeklyData} />
            ) : (
              <p className="py-8 text-center text-sm text-text-tertiary">Sin evaluaciones.</p>
            )}
          </div>

          <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
            <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Radar de Habilidades
            </h3>
            {currentSkills ? (
              <SkillRadarChart current={currentSkills} previous={previousSkills} />
            ) : (
              <p className="py-8 text-center text-sm text-text-tertiary">Sin datos de habilidades.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ProgressionBadge
            recommendation={promotion}
            overallScore={Number(intern.overallScore)}
            attendanceRate={attendanceRate}
            taskCompletion={taskCompletion}
            internId={intern.id}
          />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Tareas Recientes
            </h3>
            {intern.tasks.slice(0, 5).map((task: { id: string; title: string; type: string; status: string; priority: string; dueDate?: Date | null; score?: number | null; repositoryUrl?: string | null }) => (
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
            {intern.tasks.length === 0 && (
              <p className="text-sm text-text-tertiary">Sin tareas asignadas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
