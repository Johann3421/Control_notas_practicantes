import Badge from "@/components/ui/Badge"
import { taskStatusLabel, taskStatusColor, taskTypeLabel } from "@/lib/utils"

interface TaskCardProps {
  task: {
    title: string
    type: string
    status: string
    priority: string
    dueDate?: string | null
    score?: number | null
    repositoryUrl?: string | null
    goalTitle?: string | null
  }
}

const priorityBadge = (p: string) => {
  const map: Record<string, "danger" | "warning" | "info" | "neutral"> = {
    URGENT: "danger", HIGH: "warning", MEDIUM: "info", LOW: "neutral",
  }
  return map[p] || "neutral"
}

export default function TaskCard({ task }: TaskCardProps) {
  const { title, type, status, priority, dueDate, score, repositoryUrl, goalTitle } = task
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "DONE"

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-4 shadow-card hover:border-base-500 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-text-primary line-clamp-2">{title}</h4>
        {score && (
          <span className="font-mono text-sm font-bold text-neon-400">{score}/5</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="info">{taskTypeLabel(type)}</Badge>
        <Badge variant={priorityBadge(priority)}>{priority}</Badge>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs border ${taskStatusColor(status)}`}>
          {taskStatusLabel(status)}
        </span>
      </div>

      {goalTitle && (
        <p className="text-xs text-text-tertiary mb-2">
          Meta: <span className="text-text-code font-mono">{goalTitle}</span>
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        {dueDate && (
          <span className={`font-mono ${isOverdue ? "text-danger-400" : "text-text-tertiary"}`}>
            {isOverdue ? "⚠ " : ""}
            {new Date(dueDate).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
          </span>
        )}
        {repositoryUrl && (
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-electric-400 hover:text-electric-300 transition-colors"
          >
            Ver PR →
          </a>
        )}
      </div>
    </div>
  )
}
