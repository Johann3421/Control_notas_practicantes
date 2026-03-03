"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

interface SkillRadarChartProps {
  current: Record<string, number>
  previous?: Record<string, number>
}

export default function SkillRadarChart({ current, previous }: SkillRadarChartProps) {
  // Transform current/previous objects into array format for Recharts
  const data = Object.entries(current).map(([skill, value]) => ({
    skill,
    value,
    previous: previous?.[skill],
  }))

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card">
      <h3 className="font-sans text-base font-medium text-text-primary mb-4">Perfil de habilidades</h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#28304a" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 20]}
            tick={{ fill: "#475569", fontSize: 10 }}
            stroke="#28304a"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161c2e",
              border: "1px solid #28304a",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "12px",
            }}
          />
          {data[0]?.previous !== undefined && (
            <Radar
              name="Semana anterior"
              dataKey="previous"
              stroke="#475569"
              fill="#475569"
              fillOpacity={0.1}
              strokeDasharray="5 5"
            />
          )}
          <Radar
            name="Actual"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
