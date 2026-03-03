import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Avatar from "@/components/ui/Avatar"
import { Plus } from "lucide-react"
import { formatDate, scoreToColorClass } from "@/lib/utils"
import DeleteEvaluationButton from "@/components/mentor/DeleteEvaluationButton"

export default async function MentorEvaluationsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const evaluations = await prisma.weeklyEvaluation.findMany({
    where: { evaluatedBy: session.user.id },
    include: {
      intern: {
        include: { user: true },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evaluaciones</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Historial de evaluaciones semanales
          </p>
        </div>
        <Link href="/mentor/evaluations/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Button>
        </Link>
      </div>

      {evaluations.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-base-800 bg-base-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Practicante
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Semana
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Tech
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Soft
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Overall
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Fecha
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-base-800">
              {evaluations.map((ev) => (
                <tr key={ev.id} className="transition-colors hover:bg-base-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={ev.intern.user.name ?? ""}
                        image={ev.intern.user.image}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-text-primary">
                        {ev.intern.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">S{ev.weekNumber}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-semibold ${scoreToColorClass(Number(ev.techAverage))}`}>
                      {Number(ev.techAverage).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-semibold ${scoreToColorClass(Number(ev.softAverage))}`}>
                      {Number(ev.softAverage).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-bold ${scoreToColorClass(Number(ev.overallAverage))}`}>
                      {Number(ev.overallAverage).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(ev.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/mentor/evaluations/${ev.id}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                      <DeleteEvaluationButton
                        evaluationId={ev.id}
                        internName={ev.intern.user.name ?? ev.intern.user.email ?? ""}
                        weekNumber={ev.weekNumber}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
          <p className="text-text-tertiary">No hay evaluaciones registradas.</p>
        </div>
      )}
    </div>
  )
}
