// PDF template for intern performance report
// This module provides the data structure for PDF generation
// The actual PDF is generated in the API route using @react-pdf/renderer

export interface ReportData {
  intern: {
    name: string
    code: string
    stack: string[]
    university: string | null
    career: string | null
    startDate: Date
    endDate: Date
    currentWeek: number
    totalWeeks: number
  }
  metrics: {
    overallScore: number
    attendanceRate: number
    completedTasks: number
    totalTasks: number
    completedGoals: number
    totalGoals: number
    promotionRecommendation: string
  }
  evaluations: Array<{
    weekNumber: number
    techAverage: number
    softAverage: number
    weeklyAverage: number
    strengths: string
    improvements: string
    goals: string
  }>
  skillAverages: {
    codeQuality: number
    logicSolving: number
    stackKnowledge: number
    testing: number
    gitWorkflow: number
    documentation: number
    communication: number
    proactivity: number
    teamwork: number
    timeManagement: number
    learningSpeed: number
    professionalConduct: number
  }
  attendance: {
    totalDays: number
    presentDays: number
    lateDays: number
    absentDays: number
    justifiedDays: number
    totalHours: number
  }
  tasks: Array<{
    title: string
    type: string
    status: string
    score: number | null
    completedAt: Date | null
  }>
  goals: Array<{
    title: string
    category: string
    status: string
    targetWeek: number
    technology: string | null
  }>
  generatedAt: Date
}

export function calculateSkillAverages(evaluations: Array<Record<string, number>>) {
  if (evaluations.length === 0) {
    return {
      codeQuality: 0, logicSolving: 0, stackKnowledge: 0,
      testing: 0, gitWorkflow: 0, documentation: 0,
      communication: 0, proactivity: 0, teamwork: 0,
      timeManagement: 0, learningSpeed: 0, professionalConduct: 0,
    }
  }

  const skills = [
    "codeQuality", "logicSolving", "stackKnowledge", "testing", "gitWorkflow", "documentation",
    "communication", "proactivity", "teamwork", "timeManagement", "learningSpeed", "professionalConduct",
  ]

  const averages: Record<string, number> = {}
  for (const skill of skills) {
    const total = evaluations.reduce((sum, e) => sum + (e[skill] || 0), 0)
    averages[skill] = Math.round((total / evaluations.length) * 100) / 100
  }

  return averages as ReportData["skillAverages"]
}

export function generateProgressBar(value: number, max: number = 5, width: number = 20): string {
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  return "█".repeat(filled) + "░".repeat(empty)
}
