import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import TaskCard from "@/components/intern/TaskCard"

export default async function InternTasksPage() {
  const session = await auth()
  if (!session?.user?.internId) redirect("/login")

  const tasks = await prisma.task.findMany({
    where: { internId: session.user.internId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  })

  const pending = tasks.filter((t: { status: string }) => t.status !== "DONE")
  const completed = tasks.filter((t: { status: string }) => t.status === "DONE")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mis Tareas</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""} · {completed.length} completada{completed.length !== 1 ? "s" : ""}
        </p>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Pendientes
              </h3>
              {pending.map((task) => (
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
          )}

          {completed.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Completadas
              </h3>
              {completed.map((task) => (
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
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
          <p className="text-text-tertiary">No tienes tareas asignadas.</p>
        </div>
      )}
    </div>
  )
}
