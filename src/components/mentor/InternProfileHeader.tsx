import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import ProgressBar from "@/components/ui/ProgressBar"
import { formatDate, scoreToColor, scoreToLabel } from "@/lib/utils"

interface InternProfileHeaderProps {
  name: string
  email?: string
  code: string
  image?: string | null
  stack: string[]
  university?: string
  mentorName?: string
  currentWeek?: number
  weekProgress?: number
  totalWeeks: number
  startDate?: string
  endDate?: string
  overallScore: number
  status: string
  onGenerateReport?: () => void
}

export default function InternProfileHeader({
  name, email, code, image, stack, university, mentorName, currentWeek, weekProgress, totalWeeks,
  startDate, endDate, overallScore, status, onGenerateReport,
}: InternProfileHeaderProps) {
  const scoreColor = scoreToColor(overallScore)
  const progress = weekProgress ?? (currentWeek ? Math.round((currentWeek / totalWeeks) * 100) : 0)

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar name={name} image={image} size="xl" />
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-sans text-2xl font-bold text-text-primary tracking-tight">{name}</h1>
              <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>{status}</Badge>
            </div>
            <p className="font-mono text-sm text-text-code">{code}</p>
            {email && <p className="text-xs text-text-tertiary">{email}</p>}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {stack.map((tech) => (
              <span key={tech} className="bg-base-700 text-text-code font-mono text-xs border border-base-600 px-1.5 py-0.5 rounded">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            {mentorName && <span>Mentor: <span className="text-text-primary">{mentorName}</span></span>}
            {university && <span>Universidad: <span className="text-text-primary">{university}</span></span>}
            {currentWeek && (
              <span className="font-mono text-text-code">
                Semana {currentWeek} de {totalWeeks}
              </span>
            )}
            {startDate && endDate && (
              <span>
                {formatDate(startDate)} — {formatDate(endDate)}
              </span>
            )}
          </div>

          <ProgressBar value={progress} max={100} color="electric" size="sm" showLabel />
        </div>

        <div className="text-center">
          <span className={`font-mono text-4xl font-bold text-${scoreColor}-400 tabular-nums`}>
            {overallScore.toFixed(1)}
          </span>
          <p className="text-xs text-text-tertiary mt-1">{scoreToLabel(overallScore)}</p>
          {onGenerateReport && (
            <button
              onClick={onGenerateReport}
              className="mt-3 px-4 py-1.5 bg-base-700 border border-base-600 hover:border-base-500 text-text-primary text-xs rounded-lg transition-colors"
            >
              Generar PDF
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
