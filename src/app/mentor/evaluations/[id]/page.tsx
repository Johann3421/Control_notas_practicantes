import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import FeedbackCard from "@/components/intern/FeedbackCard"
import ScoreBreakdown from "@/components/mentor/ScoreBreakdown"
import Avatar from "@/components/ui/Avatar"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const evaluation = await prisma.weeklyEvaluation.findUnique({
    where: { id },
    include: {
      intern: { include: { user: true } },
      relatedGoals: { include: { goal: true } },
    },
  })

  if (!evaluation || evaluation.evaluatedBy !== session.user.id) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/evaluations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Evaluación Semana {evaluation.weekNumber}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Avatar
              name={evaluation.intern.user.name ?? ""}
              image={evaluation.intern.user.image}
              size="sm"
            />
            <span className="text-sm text-text-secondary">
              {evaluation.intern.user.name} · {evaluation.intern.code}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeedbackCard evaluation={{
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
        </div>
        <div>
          <ScoreBreakdown
            techAverage={Number(evaluation.techAverage)}
            softAverage={Number(evaluation.softAverage)}
            weeklyAverage={Number(evaluation.overallAverage)}
          />
        </div>
      </div>
    </div>
  )
}
