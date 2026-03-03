"use client"

import Link from "next/link"
import Badge from "@/components/ui/Badge"
import { taskStatusLabel, taskStatusColor, taskTypeLabel } from "@/lib/utils"

interface TaskRow {
  id: string
  title: string
  type: string
  priority: string
  status: string
  dueDate?: string | null
  score?: number | null
  internName: string
  internId: string
}

interface TaskBacklogProps {
  tasks: TaskRow[]
  showIntern?: boolean
}

const priorityBadge = (p: string) => {
  const map: Record<string, "danger" | "warning" | "info" | "neutral"> = {
    URGENT: "danger", HIGH: "warning", MEDIUM: "info", LOW: "neutral",
  }
  return map[p] || "neutral"
}

export default function TaskBacklog({ tasks, showIntern = true }: TaskBacklogProps) {
  return (
    <div className="bg-base-800 border border-base-600 rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-base-600">
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Título</th>
              {showIntern && <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Practicante</th>}
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Tipo</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Prioridad</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Estado</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Vencimiento</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Score</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
              return (
                <tr key={task.id} className="border-b border-base-600/50 hover:bg-base-700 transition-colors duration-100">
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-primary">{task.title}</span>
                  </td>
                  {showIntern && (
                    <td className="px-4 py-3">
                      <Link href={`/mentor/interns/${task.internId}`} className="text-sm text-electric-400 hover:text-electric-300">
                        {task.internName}
                      </Link>
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <Badge variant="info">{taskTypeLabel(task.type)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={priorityBadge(task.priority)}>{task.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs border ${taskStatusColor(task.status)}`}>
                      {taskStatusLabel(task.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.dueDate ? (
                      <span className={`font-mono text-xs ${isOverdue ? "text-danger-400" : "text-text-tertiary"}`}>
                        {new Date(task.dueDate).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.score ? (
                      <span className="font-mono text-sm font-bold text-neon-400">{task.score}/5</span>
                    ) : (
                      <span className="text-text-tertiary text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  No hay tareas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
