"use client"

import { useEffect, useRef } from "react"

interface ProgressBarProps {
  value: number
  max?: number
  color?: "electric" | "neon" | "amber" | "danger" | "violet"
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
}

const colorClasses = {
  electric: "bg-electric-500",
  neon: "bg-neon-500",
  amber: "bg-amber-500",
  danger: "bg-danger-500",
  violet: "bg-violet-500",
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

export default function ProgressBar({
  value,
  max = 100,
  color = "electric",
  showLabel = false,
  size = "md",
  animated = true,
  className = "",
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  useEffect(() => {
    if (animated && barRef.current) {
      barRef.current.style.setProperty("--progress-width", `${percentage}%`)
    }
  }, [percentage, animated])

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-text-tertiary">{value} / {max}</span>
          <span className="font-mono text-text-secondary">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-base-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          ref={barRef}
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-1000 ease-out ${animated ? "animate-progress-fill" : ""}`}
          style={animated ? { ["--progress-width" as string]: `${percentage}%`, width: `${percentage}%` } : { width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
