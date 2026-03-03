"use client"

import { useCallback } from "react"

interface ScoreSliderProps {
  name: string
  label: string
  description: string
  value: number
  onChange: (value: number) => void
}

const MARKS = [
  { value: 0,  label: "Inicial" },
  { value: 5,  label: "Básico" },
  { value: 10, label: "Competente" },
  { value: 15, label: "Avanzado" },
  { value: 20, label: "Experto" },
]

function getColor(value: number) {
  if (value >= 18) return { text: "text-neon-400",     track: "#22c55e", glow: "0 0 10px rgb(34 197 94 / 0.5)" }
  if (value >= 14) return { text: "text-electric-400", track: "#3b82f6", glow: "0 0 10px rgb(59 130 246 / 0.5)" }
  if (value >= 10) return { text: "text-amber-400",    track: "#f59e0b", glow: "0 0 10px rgb(245 158 11 / 0.5)" }
  return              { text: "text-danger-400",    track: "#ef4444", glow: "0 0 10px rgb(239 68 68 / 0.5)" }
}

export default function ScoreSlider({ name, label, description, value, onChange }: ScoreSliderProps) {
  const color = getColor(value)
  const pct = (value / 20) * 100

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" && value < 20) onChange(value + 1)
      if (e.key === "ArrowLeft"  && value > 0)  onChange(value - 1)
    },
    [value, onChange]
  )

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div>
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {description && <p className="text-xs text-text-tertiary">{description}</p>}
        </div>
        <div
          className={`font-mono text-2xl font-bold tabular-nums transition-colors duration-200 ${color.text}`}
          style={{ textShadow: color.glow }}
        >
          {value}
          <span className="text-sm font-normal text-text-tertiary ml-1">/ 20</span>
        </div>
      </div>

      {/* Range track */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          aria-label={label || name}
          aria-valuemin={0}
          aria-valuemax={20}
          aria-valuenow={value}
          className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color.track} ${pct}%, #374151 ${pct}%)`,
          }}
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-1.5 px-0.5">
          {MARKS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              className={`flex flex-col items-center gap-0.5 group transition-opacity ${
                value === m.value ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <span className={`text-[10px] font-mono leading-none ${
                value === m.value ? color.text : "text-text-tertiary"
              }`}>
                {m.value}
              </span>
              <span className="text-[9px] text-text-tertiary leading-none hidden sm:block">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name={name} value={value} />
    </div>
  )
}
