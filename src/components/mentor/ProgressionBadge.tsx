import { promotionLabel } from "@/lib/scoring"
import { Award, CheckCircle, Clock, XCircle } from "lucide-react"

interface ProgressionBadgeProps {
  recommendation: string
  overallScore: number
  attendanceRate: number
  taskCompletion: number
  internId?: string
  onConfirm?: () => void
}

const icons: Record<string, React.ReactNode> = {
  PROMOTED: <Award className="w-8 h-8" />,
  GRADUATED: <CheckCircle className="w-8 h-8" />,
  EXTENDED: <Clock className="w-8 h-8" />,
  NOT_RECOMMENDED: <XCircle className="w-8 h-8" />,
}

const colors: Record<string, string> = {
  PROMOTED: "text-neon-400 bg-neon-500/15 border-neon-500/30",
  GRADUATED: "text-electric-400 bg-electric-500/15 border-electric-500/30",
  EXTENDED: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  NOT_RECOMMENDED: "text-danger-400 bg-danger-500/15 border-danger-500/30",
}

export default function ProgressionBadge({
  recommendation, overallScore, attendanceRate, taskCompletion, onConfirm,
}: ProgressionBadgeProps) {
  return (
    <div className={`border rounded-xl p-6 text-center space-y-4 ${colors[recommendation]}`}>
      <div className="flex justify-center">{icons[recommendation]}</div>
      <div>
        <h3 className="font-sans text-xl font-bold">{promotionLabel(recommendation)}</h3>
        <p className="text-xs text-text-tertiary mt-1">Recomendación automática basada en métricas</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-text-tertiary">Score</p>
          <p className="font-mono font-bold text-text-primary">{overallScore.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-text-tertiary">Asistencia</p>
          <p className="font-mono font-bold text-text-primary">{attendanceRate}%</p>
        </div>
        <div>
          <p className="text-text-tertiary">Objetivos</p>
          <p className="font-mono font-bold text-text-primary">{Math.round(taskCompletion)}%</p>
        </div>
      </div>

      {onConfirm && (
        <button
          onClick={onConfirm}
          className="w-full py-2 bg-base-700 border border-base-600 hover:border-base-500 text-text-primary text-sm rounded-lg transition-colors"
        >
          Confirmar y guardar recomendación
        </button>
      )}
    </div>
  )
}
