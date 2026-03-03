"use client"
import { useEvaluationStore } from "@/store/evaluation"

export function useEvaluation() {
  const store = useEvaluationStore()

  const isComplete = !!(
    store.internId &&
    store.weekNumber &&
    store.strengths.length >= 10 &&
    store.improvements.length >= 10 &&
    store.goals.length >= 10
  )

  // Map array index to legacy column names (first 6 of each)
  const techKeys = ["codeQuality", "problemSolving", "gitUsage", "tooling", "codeReview", "architecture"] as const
  const softKeys = ["communication", "teamwork", "initiative", "timeManagement", "adaptability", "documentation"] as const

  const legacyTechScores = Object.fromEntries(
    techKeys.map((k, i) => [k, store.techSkills[i]?.score ?? 3])
  )
  const legacySoftScores = Object.fromEntries(
    softKeys.map((k, i) => [k, store.softSkills[i]?.score ?? 3])
  )

  const formData = {
    internId: store.internId!,
    weekNumber: store.weekNumber!,
    // legacy columns for backward compat
    ...legacyTechScores,
    ...legacySoftScores,
    // full custom skills data
    skillsData: {
      tech: store.techSkills,
      soft: store.softSkills,
    },
    strengths: store.strengths,
    improvements: store.improvements,
    goals: store.goals,
    relatedGoals: store.relatedGoals,
  }

  return {
    ...store,
    isComplete,
    formData,
  }
}
