import ProgressBar from "@/components/ui/ProgressBar"
import { scoreToColor, scoreToLabel } from "@/lib/utils"

interface FeedbackCardProps {
  evaluation: {
    weekNumber: number
    weekStart: string
    weekEnd: string
    overallAverage: number
    techAverage: number
    softAverage: number
    strengths: string
    improvements: string
    goals: string
  }
}

export default function FeedbackCard({ evaluation }: FeedbackCardProps) {
  const {
    weekNumber, weekStart, weekEnd, overallAverage, techAverage, softAverage,
    strengths, improvements, goals,
  } = evaluation
  const weeklyAverage = Number(overallAverage)
  const color = scoreToColor(weeklyAverage)
  const label = scoreToLabel(weeklyAverage)

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl shadow-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-sans text-base font-medium text-text-primary">
              Semana {weekNumber}
            </h3>
            <p className="text-xs text-text-tertiary font-mono">{weekStart} – {weekEnd}</p>
          </div>
          <div className="text-right">
            <span className={`font-mono text-2xl font-bold text-${color}-400`}>
              {weeklyAverage.toFixed(1)}
            </span>
            <span className="text-text-tertiary text-sm ml-1">/ 20.0</span>
            <p className={`text-xs text-${color}-400`}>{label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-xs text-text-tertiary">Técnico</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-neon-400">{Number(techAverage).toFixed(1)}</span>
              <ProgressBar value={Number(techAverage)} max={20} color="neon" size="sm" className="flex-1" />
            </div>
          </div>
          <div>
            <span className="text-xs text-text-tertiary">Soft Skills</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-violet-400">{Number(softAverage).toFixed(1)}</span>
              <ProgressBar value={Number(softAverage)} max={20} color="violet" size="sm" className="flex-1" />
            </div>
          </div>
        </div>

        {/* Feedback sections */}
        <div className="space-y-3">
          <div className="bg-neon-500/10 border-l-2 border-neon-500 rounded-r-lg p-3">
            <span className="text-xs font-semibold text-neon-400 uppercase tracking-widest">Fortalezas</span>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{strengths}</p>
          </div>
          <div className="bg-amber-500/10 border-l-2 border-amber-500 rounded-r-lg p-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Áreas de mejora</span>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{improvements}</p>
          </div>
          <div className="bg-electric-500/10 border-l-2 border-electric-500 rounded-r-lg p-3">
            <span className="text-xs font-semibold text-electric-400 uppercase tracking-widest">Objetivos</span>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{goals}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
