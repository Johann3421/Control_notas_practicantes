import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import InternRoadmapClient from "../../intern/roadmap/RoadmapClient"

export default async function MentorRoadmapPage() {
  const session = await auth()
  if (!session || (session.user?.role !== "MENTOR" && session.user?.role !== "ADMIN"))
    redirect("/login")

  // For mentors show all learning goals (could be filtered per intern later)
  const goals = await prisma.learningGoal.findMany({
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Roadmap de Aprendizaje</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Visualización 3D interactiva de los objetivos definidos por los practicantes
        </p>
      </div>

      {goals.length > 0 ? (
        <InternRoadmapClient
          goals={goals.map((g: any) => ({
            id: g.id,
            title: g.title,
            category: g.category,
            status: g.status,
            priority: g.priority,
            notes: g.notes,
          }))}
        />
      ) : (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
          <p className="text-text-tertiary">Aún no hay objetivos de aprendizaje disponibles.</p>
        </div>
      )}
    </div>
  )
}
