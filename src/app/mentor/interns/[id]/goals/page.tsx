import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Button from "@/components/ui/Button"
import GoalsManager from "./_components/GoalsManager"
import { calculateAttendanceRate, getPromotionRecommendation } from "@/lib/scoring"

export default async function InternGoalsPage({
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
      user: { select: { name: true, email: true } },
      learningGoals: { orderBy: [{ priority: "desc" }, { targetWeek: "asc" }] },
      attendance: { select: { status: true } },
      tasks: { select: { status: true } },
    },
  })

  if (!intern || intern.mentorId !== session.user.id) notFound()

  const attendanceRate = calculateAttendanceRate(intern.attendance.map((a) => a.status))
  const tasksCompleted = intern.tasks.filter((t) => t.status === "DONE").length
  const taskCompletion = intern.tasks.length > 0
    ? Math.round((tasksCompleted / intern.tasks.length) * 100)
    : 0
  const autoPromotion = getPromotionRecommendation(
    Number(intern.overallScore),
    attendanceRate,
    taskCompletion
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/mentor/interns/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver al perfil
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Objetivos de Aprendizaje</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {intern.user.name} · {intern.code}
          </p>
        </div>
      </div>

      <GoalsManager
        internId={intern.id}
        internName={intern.user.name ?? ""}
        totalWeeks={intern.totalWeeks}
        initialGoals={intern.learningGoals.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description ?? "",
          category: g.category as string,
          priority: g.priority as string,
          status: g.status as string,
          targetWeek: g.targetWeek,
          technology: g.technology ?? "",
          notes: g.notes ?? "",
          completedAt: g.completedAt?.toISOString() ?? null,
        }))}
        currentPromotion={(intern.promotionRecommendation as string | null) ?? null}
        autoPromotion={autoPromotion}
        overallScore={Number(intern.overallScore)}
        attendanceRate={attendanceRate}
        taskCompletion={taskCompletion}
      />
    </div>
  )
}
