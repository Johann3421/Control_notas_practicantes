import ProgressBar from "@/components/ui/ProgressBar"
import Badge from "@/components/ui/Badge"
import { scoreToLabel, scoreToColor } from "@/lib/utils"

interface ScoreBreakdownProps {
  techAverage: number
  softAverage: number
  weeklyAverage: number
}

export default function ScoreBreakdown({ techAverage, softAverage, weeklyAverage }: ScoreBreakdownProps) {
  const color = scoreToColor(weeklyAverage)
  const label = scoreToLabel(weeklyAverage)

  const colorToBadge = (c: string) => {
    if (c === "neon") return "success" as const
    if (c === "electric") return "info" as const
    if (c === "amber") return "warning" as const
    return "danger" as const
  }

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card space-y-6">
      <h3 className="font-sans text-base font-medium text-text-primary">Preview en tiempo real</h3>

      {/* Overall score */}
      <div className="text-center">
        <span className={`font-mono text-5xl font-bold text-${color}-400 tabular-nums`}>
          {weeklyAverage.toFixed(2)}
        </span>
        <p className="text-sm text-text-tertiary mt-1">/ 20.00</p>
        <Badge variant={colorToBadge(color)} className="mt-2">{label}</Badge>
      </div>

      {/* Tech average */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-tertiary uppercase tracking-widest font-semibold">Técnico (60%)</span>
          <span className="font-mono text-sm font-bold text-neon-400">{techAverage.toFixed(2)}</span>
        </div>
        <ProgressBar value={techAverage} max={20} color="neon" size="md" />
      </div>

      {/* Soft average */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-tertiary uppercase tracking-widest font-semibold">Soft Skills (40%)</span>
          <span className="font-mono text-sm font-bold text-violet-400">{softAverage.toFixed(2)}</span>
        </div>
        <ProgressBar value={softAverage} max={20} color="violet" size="md" />
      </div>

      {/* Formula reminder */}
      <div className="text-xs text-text-tertiary border-t border-base-600 pt-4">
        <p className="font-mono">Promedio = Tech × 0.60 + Soft × 0.40</p>
        <p className="mt-1">
          = {techAverage.toFixed(2)} × 0.60 + {softAverage.toFixed(2)} × 0.40
        </p>
        <p className="font-bold text-text-secondary mt-1">
          = {weeklyAverage.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
