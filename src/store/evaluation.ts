import { create } from "zustand"
import type { SkillItem } from "@/types"
import { TECH_SKILLS, SOFT_SKILLS } from "@/lib/scoring"

// ─── Helpers ────────────────────────────────────────────────────────────────
function calcAverages(techSkills: SkillItem[], softSkills: SkillItem[]) {
  const techAvg = techSkills.length > 0
    ? techSkills.reduce((s, e) => s + e.score, 0) / techSkills.length
    : 0
  const softAvg = softSkills.length > 0
    ? softSkills.reduce((s, e) => s + e.score, 0) / softSkills.length
    : 0
  const overallAvg = techAvg * 0.6 + softAvg * 0.4
  return {
    techAverage: Math.round(techAvg * 100) / 100,
    softAverage: Math.round(softAvg * 100) / 100,
    overallAverage: Math.round(overallAvg * 100) / 100,
  }
}

function defaultTech(): SkillItem[] {
  return TECH_SKILLS.map((s) => ({ label: s.label, description: s.description, score: 10 }))
}

function defaultSoft(): SkillItem[] {
  return SOFT_SKILLS.map((s) => ({ label: s.label, description: s.description, score: 10 }))
}

// ─── Store interface ─────────────────────────────────────────────────────────
interface EvaluationStore {
  internId: string | null
  weekNumber: number | null

  techSkills: SkillItem[]
  softSkills: SkillItem[]

  strengths: string
  improvements: string
  goals: string
  relatedGoals: Array<{ goalId: string; progressNote: string }>

  techAverage: number
  softAverage: number
  overallAverage: number

  setIntern: (internId: string) => void
  setWeek: (week: number) => void

  setTechScore: (index: number, score: number) => void
  setSoftScore: (index: number, score: number) => void

  updateTechSkill: (index: number, field: "label" | "description", value: string) => void
  updateSoftSkill: (index: number, field: "label" | "description", value: string) => void

  addTechSkill: () => void
  removeTechSkill: (index: number) => void
  addSoftSkill: () => void
  removeSoftSkill: (index: number) => void

  resetTechSkills: () => void
  resetSoftSkills: () => void

  setStrengths: (value: string) => void
  setImprovements: (value: string) => void
  setGoals: (value: string) => void

  toggleGoal: (goalId: string) => void
  setGoalNote: (goalId: string, note: string) => void

  reset: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────
const initTech = defaultTech()
const initSoft = defaultSoft()

export const useEvaluationStore = create<EvaluationStore>((set) => ({
  internId: null,
  weekNumber: null,

  techSkills: initTech,
  softSkills: initSoft,

  strengths: "",
  improvements: "",
  goals: "",
  relatedGoals: [],

  ...calcAverages(initTech, initSoft),

  setIntern: (internId) => set({ internId }),
  setWeek: (week) => set({ weekNumber: week }),

  setTechScore: (index, score) =>
    set((state) => {
      const techSkills = state.techSkills.map((s, i) => (i === index ? { ...s, score } : s))
      return { techSkills, ...calcAverages(techSkills, state.softSkills) }
    }),

  setSoftScore: (index, score) =>
    set((state) => {
      const softSkills = state.softSkills.map((s, i) => (i === index ? { ...s, score } : s))
      return { softSkills, ...calcAverages(state.techSkills, softSkills) }
    }),

  updateTechSkill: (index, field, value) =>
    set((state) => ({
      techSkills: state.techSkills.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    })),

  updateSoftSkill: (index, field, value) =>
    set((state) => ({
      softSkills: state.softSkills.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    })),

  addTechSkill: () =>
    set((state) => ({
      techSkills: [...state.techSkills, { label: "Nueva habilidad", description: "", score: 3 }],
    })),

  removeTechSkill: (index) =>
    set((state) => {
      if (state.techSkills.length <= 1) return {}
      const techSkills = state.techSkills.filter((_, i) => i !== index)
      return { techSkills, ...calcAverages(techSkills, state.softSkills) }
    }),

  addSoftSkill: () =>
    set((state) => ({
      softSkills: [...state.softSkills, { label: "Nueva habilidad", description: "", score: 3 }],
    })),

  removeSoftSkill: (index) =>
    set((state) => {
      if (state.softSkills.length <= 1) return {}
      const softSkills = state.softSkills.filter((_, i) => i !== index)
      return { softSkills, ...calcAverages(state.techSkills, softSkills) }
    }),

  resetTechSkills: () =>
    set((state) => {
      const techSkills = defaultTech()
      return { techSkills, ...calcAverages(techSkills, state.softSkills) }
    }),

  resetSoftSkills: () =>
    set((state) => {
      const softSkills = defaultSoft()
      return { softSkills, ...calcAverages(state.techSkills, softSkills) }
    }),

  setStrengths: (value) => set({ strengths: value }),
  setImprovements: (value) => set({ improvements: value }),
  setGoals: (value) => set({ goals: value }),

  toggleGoal: (goalId) =>
    set((state) => {
      const exists = state.relatedGoals.find((g) => g.goalId === goalId)
      if (exists) {
        return { relatedGoals: state.relatedGoals.filter((g) => g.goalId !== goalId) }
      }
      return { relatedGoals: [...state.relatedGoals, { goalId, progressNote: "" }] }
    }),

  setGoalNote: (goalId, note) =>
    set((state) => ({
      relatedGoals: state.relatedGoals.map((g) =>
        g.goalId === goalId ? { ...g, progressNote: note } : g
      ),
    })),

  reset: () => {
    const tech = defaultTech()
    const soft = defaultSoft()
    set({
      internId: null,
      weekNumber: null,
      techSkills: tech,
      softSkills: soft,
      strengths: "",
      improvements: "",
      goals: "",
      relatedGoals: [],
      ...calcAverages(tech, soft),
    })
  },
}))
