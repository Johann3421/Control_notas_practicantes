import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Avatar from "@/components/ui/Avatar"
import { Plus } from "lucide-react"
import { formatDate, taskStatusColor, taskStatusLabel, taskTypeLabel } from "@/lib/utils"

export default async function MentorTasksPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const tasks = await prisma.task.findMany({
    where: {
      intern: { mentorId: session.user.id },
    },
    include: {
      intern: { include: { user: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tareas</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {tasks.length} tarea{tasks.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link href="/mentor/tasks/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </Link>
      </div>

      {tasks.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-base-800 bg-base-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Tarea
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Practicante
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Vencimiento
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-base-800">
              {tasks.map((task: { id: string; title: string; type: string; status: string; dueDate: Date | null; intern: { user: { name: string | null; image: string | null } } }) => (
                <tr key={task.id} className="transition-colors hover:bg-base-800/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text-primary">{task.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={task.intern.user.name ?? ""}
                        image={task.intern.user.image}
                        size="sm"
                      />
                      <span className="text-sm text-text-secondary">
                        {task.intern.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{taskTypeLabel(task.type)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={taskStatusColor(task.status) as "neutral" | "success" | "warning" | "danger"}>
                      {taskStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/mentor/tasks/${task.id}/edit`}>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
          <p className="text-text-tertiary">No hay tareas creadas.</p>
        </div>
      )}
    </div>
  )
}
