import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { calculateAttendanceRate, getPromotionRecommendation } from "@/lib/scoring"
import { formatDate } from "@/lib/utils"

export default async function InternReportPage({
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
      mentor: true,
      evaluations: { orderBy: { weekNumber: "asc" } },
      attendance: true,
      tasks: true,
      learningGoals: true,
    },
  })

  if (!intern || intern.mentorId !== session.user.id) {
    notFound()
  }

  const attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
  const tasksCompleted = intern.tasks.filter((t: { status: string }) => t.status === "DONE").length
  const taskCompletion = intern.tasks.length > 0 ? Math.round((tasksCompleted / intern.tasks.length) * 100) : 0
  const autoPromotion = getPromotionRecommendation(Number(intern.overallScore), attendanceRate, taskCompletion)
  const promotion = (intern.promotionRecommendation as string | null) ?? autoPromotion

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/mentor/interns/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Reporte — {intern.user.name}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{intern.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/reports/${id}/pdf`} download>
            <Button variant="primary" size="sm">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </a>
          <a href={`/api/reports/${id}/excel`} download>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </a>
        </div>
      </div>

      {/* Report content */}
      <div className="space-y-6 print:space-y-4" id="report-content">
        {/* Summary card */}
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Resumen General
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-text-tertiary">Score General</p>
              <p className="text-2xl font-bold text-electric">{Number(intern.overallScore).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Asistencia</p>
              <p className="text-2xl font-bold text-neon">{attendanceRate}%</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Tareas</p>
              <p className="text-2xl font-bold text-amber">{tasksCompleted}/{intern.tasks.length}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary">Recomendación</p>
              <p className="text-2xl font-bold text-violet">{promotion}</p>
            </div>
          </div>
        </div>

        {/* Evaluations table */}
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Evaluaciones por Semana
          </h3>
          {intern.evaluations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-base-800">
                    <th className="pb-2 text-left text-xs text-text-tertiary">Semana</th>
                    <th className="pb-2 text-left text-xs text-text-tertiary">Tech</th>
                    <th className="pb-2 text-left text-xs text-text-tertiary">Soft</th>
                    <th className="pb-2 text-left text-xs text-text-tertiary">Overall</th>
                    <th className="pb-2 text-left text-xs text-text-tertiary">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-800">
                  {intern.evaluations.map((ev: { id: string; weekNumber: number; techAverage: unknown; softAverage: unknown; overallAverage: unknown; createdAt: Date }) => (
                    <tr key={ev.id}>
                      <td className="py-2 font-mono">S{ev.weekNumber}</td>
                      <td className="py-2 font-mono">{Number(ev.techAverage).toFixed(1)}</td>
                      <td className="py-2 font-mono">{Number(ev.softAverage).toFixed(1)}</td>
                      <td className="py-2 font-mono font-semibold">{Number(ev.overallAverage).toFixed(1)}</td>
                      <td className="py-2 text-text-tertiary">{formatDate(ev.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">Sin evaluaciones registradas.</p>
          )}
        </div>

        {/* Goals */}
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Objetivos de Aprendizaje
          </h3>
          {intern.learningGoals.length > 0 ? (
            <div className="divide-y divide-base-800">
              {intern.learningGoals.map((goal: { id: string; title: string; category: string; status: string }) => (
                <div key={goal.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{goal.title}</p>
                    <p className="text-xs text-text-tertiary">{goal.category}</p>
                  </div>
                  <span className={`text-xs font-medium ${
                    goal.status === "COMPLETED" ? "text-neon" :
                    goal.status === "IN_PROGRESS" ? "text-electric" : "text-text-tertiary"
                  }`}>
                    {goal.status === "COMPLETED" ? "Completado" :
                     goal.status === "IN_PROGRESS" ? "En Progreso" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">Sin objetivos definidos.</p>
          )}
        </div>
      </div>
    </div>
  )
}
