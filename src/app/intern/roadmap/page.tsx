import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import InternRoadmapClient from "./RoadmapClient"

export default async function InternRoadmapPage() {
  const session = await auth()
  if (!session?.user?.internId) redirect("/login")

  const goals = await prisma.learningGoal.findMany({
    where: { internId: session.user.internId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Roadmap de Aprendizaje</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Visualización 3D interactiva de tus objetivos y progreso
        </p>
      </div>

      {goals.length > 0 ? (
        <InternRoadmapClient
          goals={goals.map((g: { id: string; title: string; category: string; status: string; priority: string; notes: string | null }) => ({
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
          <p className="text-text-tertiary">
            Tu mentor aún no ha definido objetivos de aprendizaje.
          </p>
        </div>
      )}
    </div>
  )
}
