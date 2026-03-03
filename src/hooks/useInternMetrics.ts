"use client"
import { useState, useEffect } from "react"

interface InternMetrics {
  overallScore: number
  attendanceRate: number
  completedGoals: number
  totalGoals: number
  completedTasks: number
  totalTasks: number
  activeTasks: number
  trend: "up" | "stable" | "down"
  latestWeeklyScore: number
  promotionRecommendation: string
}

export function useInternMetrics(internId: string | null) {
  const [metrics, setMetrics] = useState<InternMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!internId) {
      setLoading(false)
      return
    }

    async function fetchMetrics() {
      try {
        const res = await fetch(`/api/reports/${internId}/csv`)
        if (res.ok) {
          // Metrics are calculated server-side
        }
      } catch {
        // Fallback - metrics loaded via server component
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [internId])

  return { metrics, loading }
}
