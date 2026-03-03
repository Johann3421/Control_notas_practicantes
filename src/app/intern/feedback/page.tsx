import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FeedbackCard from "@/components/intern/FeedbackCard"

export default async function InternFeedbackPage() {
  const session = await auth()
  if (!session?.user?.internId) redirect("/login")

  const evaluations = await prisma.weeklyEvaluation.findMany({
    where: { internId: session.user.internId },
    orderBy: { weekNumber: "desc" },
    include: {
      relatedGoals: { include: { goal: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Feedback Semanal</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Historial completo de tus evaluaciones semanales
        </p>
      </div>

      {evaluations.length > 0 ? (
        <div className="space-y-6">
          {evaluations.map((evaluation) => (
            <FeedbackCard key={evaluation.id} evaluation={{
              weekNumber: evaluation.weekNumber,
              weekStart: evaluation.weekStart.toISOString().split('T')[0],
              weekEnd: evaluation.weekEnd.toISOString().split('T')[0],
              overallAverage: Number(evaluation.overallAverage),
              techAverage: Number(evaluation.techAverage),
              softAverage: Number(evaluation.softAverage),
              strengths: evaluation.strengths,
              improvements: evaluation.improvements,
              goals: evaluation.goals,
            }} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
          <p className="text-text-tertiary">Aún no tienes evaluaciones registradas.</p>
        </div>
      )}
    </div>
  )
}
