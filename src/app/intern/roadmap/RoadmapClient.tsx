"use client"

import dynamic from "next/dynamic"
import Skeleton from "@/components/ui/Skeleton"

const SkillTree3D = dynamic(() => import("@/components/three/SkillTree3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-150 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
      <Skeleton className="h-full w-full rounded-2xl" />
    </div>
  ),
})

export default function InternRoadmapClient({
  goals,
}: {
  goals: Array<{
    id: string
    title: string
    category: string
    status: string
    priority: string
    notes: string | null
  }>
}) {
  const mappedGoals = goals.map((g) => ({
    id: g.id,
    title: g.title,
    technology: g.category,
    status: g.status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
  }))

  return <SkillTree3D goals={mappedGoals} />
}
