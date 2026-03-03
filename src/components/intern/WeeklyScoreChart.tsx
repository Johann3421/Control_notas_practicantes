"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Legend } from "recharts"

interface WeeklyScoreChartProps {
  data: Array<{
    week: string
    techAverage: number
    softAverage: number
    weeklyAverage: number
  }>
}

export default function WeeklyScoreChart({ data }: WeeklyScoreChartProps) {
  if (data.length < 2) {
    return (
      <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card">
        <h3 className="font-sans text-base font-medium text-text-primary mb-4">Evolución semanal</h3>
        <div className="flex items-center justify-center h-48 text-text-tertiary text-sm">
          Completa más semanas para ver tu evolución
        </div>
      </div>
    )
  }

  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card">
      <h3 className="font-sans text-base font-medium text-text-primary mb-4">Evolución semanal</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#28304a" />
          <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#28304a" />
          <YAxis domain={[0, 20]} tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#28304a" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161c2e",
              border: "1px solid #28304a",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
          />
          <ReferenceLine y={12} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Mínimo", fill: "#f59e0b", fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="weeklyAverage"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Promedio general"
          />
          <Line
            type="monotone"
            dataKey="techAverage"
            stroke="#22c55e"
            strokeWidth={1.5}
            dot={{ fill: "#22c55e", r: 3 }}
            name="Técnico"
          />
          <Line
            type="monotone"
            dataKey="softAverage"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            dot={{ fill: "#8b5cf6", r: 3 }}
            name="Soft skills"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
