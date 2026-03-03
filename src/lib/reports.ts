import { prisma } from "./prisma"
import { calculateAttendanceRate, calculateOverallScore, getPromotionRecommendation } from "./scoring"

export async function getInternMetrics(internId: string) {
  const intern = await prisma.intern.findUnique({
    where: { id: internId },
    include: {
      user: { select: { name: true, email: true, image: true } },
      evaluations: {
        orderBy: { weekNumber: "asc" },
        select: {
          id: true,
          weekNumber: true,
          weekStart: true,
          weekEnd: true,
          techAverage: true,
          softAverage: true,
          overallAverage: true,
          codeQuality: true,
          problemSolving: true,
          gitUsage: true,
          tooling: true,
          codeReview: true,
          architecture: true,
          communication: true,
          teamwork: true,
          initiative: true,
          timeManagement: true,
          adaptability: true,
          documentation: true,
          strengths: true,
          improvements: true,
          goals: true,
          createdAt: true,
        },
      },
      attendance: {
        orderBy: { date: "desc" },
        select: {
          id: true,
          date: true,
          status: true,
          checkIn: true,
          checkOut: true,
          hoursWorked: true,
          lateMinutes: true,
          notes: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          priority: true,
          status: true,
          dueDate: true,
          completedAt: true,
          score: true,
          feedback: true,
          estimatedHours: true,
          actualHours: true,
          repositoryUrl: true,
          goalId: true,
        },
      },
      learningGoals: {
        orderBy: { targetWeek: "asc" },
        select: {
          id: true,
          title: true,
          category: true,
          technology: true,
          targetWeek: true,
          status: true,
          priority: true,
          completedAt: true,
          notes: true,
        },
      },
    },
  })

  if (!intern) return null

  const attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
  const overallScore = calculateOverallScore(
    intern.evaluations.map((e: { overallAverage: unknown }) => ({ overallAverage: Number(e.overallAverage) }))
  )
  const completedGoals = intern.learningGoals.filter((g: { status: string }) => g.status === "COMPLETED").length
  const totalGoals = intern.learningGoals.length
  const completedTasks = intern.tasks.filter((t: { status: string }) => t.status === "DONE").length
  const totalTasks = intern.tasks.length
  const activeTasks = intern.tasks.filter((t: { status: string }) => t.status === "IN_PROGRESS" || t.status === "TODO").length
  const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const autoPromotion = getPromotionRecommendation(overallScore, attendanceRate, taskCompletion)
  const promotionRecommendation = (intern.promotionRecommendation as string | null) ?? autoPromotion

  // Calculate trend (compare last 2 evaluations)
  const evals = intern.evaluations
  let trend: "up" | "stable" | "down" = "stable"
  if (evals.length >= 2) {
    const last = Number(evals[evals.length - 1].overallAverage)
    const prev = Number(evals[evals.length - 2].overallAverage)
    if (last > prev + 0.2) trend = "up"
    else if (last < prev - 0.2) trend = "down"
  }

  const latestEval = evals.length > 0 ? evals[evals.length - 1] : null

  return {
    intern,
    metrics: {
      overallScore,
      attendanceRate,
      completedGoals,
      totalGoals,
      completedTasks,
      totalTasks,
      activeTasks,
      trend,
      promotionRecommendation,
      latestWeeklyScore: latestEval ? Number(latestEval.overallAverage) : 0,
    },
  }
}

export async function getTeamOverview(mentorId: string) {
  const interns = await prisma.intern.findMany({
    where: { mentorId, status: "ACTIVE" },
    include: {
      user: { select: { name: true, email: true, image: true } },
      evaluations: {
        orderBy: { weekNumber: "desc" },
        take: 2,
        select: { overallAverage: true, weekNumber: true },
      },
      attendance: {
        select: { status: true },
      },
      tasks: {
        where: { status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] } },
        select: { id: true },
      },
    },
  })

  return interns.map((intern) => {
    const attendanceRate = calculateAttendanceRate(intern.attendance.map((a) => a.status))
    const latestScore = intern.evaluations[0] ? Number(intern.evaluations[0].overallAverage) : 0
    const prevScore = intern.evaluations[1] ? Number(intern.evaluations[1].overallAverage) : 0
    let trend: "up" | "stable" | "down" = "stable"
    if (intern.evaluations.length >= 2) {
      if (latestScore > prevScore + 0.2) trend = "up"
      else if (latestScore < prevScore - 0.2) trend = "down"
    }

    return {
      id: intern.id,
      code: intern.code,
      name: intern.user.name,
      image: intern.user.image,
      stack: intern.stack,
      currentWeek: intern.currentWeek,
      totalWeeks: intern.totalWeeks,
      latestScore,
      attendanceRate,
      activeTasks: intern.tasks.length,
      trend,
    }
  })
}
