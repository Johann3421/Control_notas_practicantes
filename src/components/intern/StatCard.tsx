"use client"

import type { StatCardProps } from "@/types"

export default function StatCard({ label, value, unit, trend, color, icon, subtitle }: StatCardProps) {
  const colorMap = {
    electric: "border-l-electric-500 hover:shadow-electric",
    neon: "border-l-neon-500 hover:shadow-neon",
    amber: "border-l-amber-500",
    danger: "border-l-danger-500",
    violet: "border-l-violet-500",
  }

  const trendColors = {
    up: "text-neon-400",
    down: "text-danger-400",
    stable: "text-amber-400",
  }

  return (
    <div className={`bg-base-800 border border-base-600 rounded-xl p-5 shadow-card shadow-inset-top border-l-4 ${colorMap[color]} hover:shadow-card-hover transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <span className="font-sans text-xs font-semibold uppercase tracking-widest text-text-tertiary">
          {label}
        </span>
        <div className="text-text-tertiary">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold text-text-primary tabular-nums animate-score-count">
          {value}
        </span>
        {unit && <span className="text-sm text-text-tertiary">{unit}</span>}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
      )}
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${trendColors[trend.value > 0 ? "up" : trend.value < 0 ? "down" : "stable"]}`}>
          <span>{trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
