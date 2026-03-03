"use client"

import Link from "next/link"
import Avatar from "@/components/ui/Avatar"
import ProgressBar from "@/components/ui/ProgressBar"
import { scoreToColor } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Eye, Star } from "lucide-react"

interface InternRow {
  id: string
  code: string
  name: string
  image?: string | null
  stack: string[]
  currentWeek: number
  totalWeeks: number
  latestScore: number
  attendanceRate: number
  activeTasks: number
  trend: "up" | "stable" | "down"
}

interface TeamOverviewTableProps {
  interns: InternRow[]
}

const trendIcons = {
  up: <TrendingUp className="w-4 h-4 text-neon-400" />,
  stable: <Minus className="w-4 h-4 text-amber-400" />,
  down: <TrendingDown className="w-4 h-4 text-danger-400" />,
}

export default function TeamOverviewTable({ interns }: TeamOverviewTableProps) {
  return (
    <div className="bg-base-800 border border-base-600 rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-base-600">
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Practicante</th>
              <th scope="col" className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Stack</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Semana</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Score</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Asistencia</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Tareas</th>
              <th scope="col" className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Tendencia</th>
              <th scope="col" className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-tertiary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {interns.map((intern) => {
              const color = scoreToColor(intern.latestScore)
              return (
                <tr key={intern.id} className="border-b border-base-600/50 hover:bg-base-700 transition-colors duration-100">
                  <td className="px-4 py-3">
                    <Link href={`/mentor/interns/${intern.id}`} className="flex items-center gap-3 group">
                      <Avatar name={intern.name} image={intern.image} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-text-primary group-hover:text-electric-400 transition-colors">{intern.name}</p>
                        <p className="font-mono text-xs text-text-code">{intern.code}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {intern.stack.slice(0, 3).map((tech) => (
                        <span key={tech} className="bg-base-700 text-text-code font-mono text-xs border border-base-600 px-1.5 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono text-sm text-text-secondary">
                      {intern.currentWeek}/{intern.totalWeeks}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-sm font-bold text-${color}-400`}>
                      {intern.latestScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-mono text-xs text-text-secondary">{intern.attendanceRate}%</span>
                      <ProgressBar
                        value={intern.attendanceRate}
                        max={100}
                        color={intern.attendanceRate >= 90 ? "neon" : intern.attendanceRate >= 75 ? "amber" : "danger"}
                        size="sm"
                        animated={false}
                        className="w-16"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono text-sm text-text-secondary">{intern.activeTasks}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {trendIcons[intern.trend]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/mentor/evaluations/new?internId=${intern.id}`}
                        className="p-1.5 text-text-tertiary hover:text-electric-400 hover:bg-base-600 rounded-lg transition-colors"
                        title="Evaluar"
                      >
                        <Star className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/mentor/interns/${intern.id}`}
                        className="p-1.5 text-text-tertiary hover:text-electric-400 hover:bg-base-600 rounded-lg transition-colors"
                        title="Ver perfil"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
