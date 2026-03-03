import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateWeeklyAverages } from "@/lib/scoring"
import type { SkillItem } from "@/types"

// legacy column keys in order (for backward compat mapping)
const TECH_KEYS = ["codeQuality", "problemSolving", "gitUsage", "tooling", "codeReview", "architecture"] as const
const SOFT_KEYS = ["communication", "teamwork", "initiative", "timeManagement", "adaptability", "documentation"] as const

function avgFromSkills(skills: SkillItem[]) {
  if (skills.length === 0) return 0
  return skills.reduce((s, e) => s + e.score, 0) / skills.length
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // If requesting intern list for dropdown
  const wantInterns = req.nextUrl.searchParams.get("interns")
  if (wantInterns) {
    const interns = await prisma.intern.findMany({
      where: { mentorId: session.user.id, status: "ACTIVE" },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    })
    return NextResponse.json({
      interns: interns.map((i: { id: string; code: string; user: { name: string | null } }) => ({
        id: i.id,
        name: i.user.name ?? "—",
        code: i.code,
      })),
    })
  }

  // Get evaluations for logged-in mentor
  const evaluations = await prisma.weeklyEvaluation.findMany({
    where: { evaluatedBy: session.user.id },
    include: {
      intern: { include: { user: true } },
      relatedGoals: { include: { goal: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ evaluations })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()

  try {
  const {
    internId,
    weekNumber,
    codeQuality,
    problemSolving,
    gitUsage,
    tooling,
    codeReview,
    architecture,
    communication,
    teamwork,
    initiative,
    timeManagement,
    adaptability,
    documentation,
    strengths,
    improvements,
    goals,
    relatedGoals: relatedGoalIds,
    skillsData,  // NEW: { tech: SkillItem[], soft: SkillItem[] }
  } = body

  // Normalize incoming types to avoid Prisma type errors
  const normalizedWeek = typeof weekNumber === "string" ? Number(weekNumber) : weekNumber

  // Ensure skillsData scores are numbers
  if (skillsData && typeof skillsData === "object") {
    if (Array.isArray(skillsData.tech)) {
      skillsData.tech = skillsData.tech.map((s: any) => ({ ...s, score: Number(s.score) }))
    }
    if (Array.isArray(skillsData.soft)) {
      skillsData.soft = skillsData.soft.map((s: any) => ({ ...s, score: Number(s.score) }))
    }
  }

  // Coerce legacy numeric fields if provided as strings
  const coerced: Record<string, number> = {
    codeQuality: Number(codeQuality ?? 0),
    problemSolving: Number(problemSolving ?? 0),
    gitUsage: Number(gitUsage ?? 0),
    tooling: Number(tooling ?? 0),
    codeReview: Number(codeReview ?? 0),
    architecture: Number(architecture ?? 0),
    communication: Number(communication ?? 0),
    teamwork: Number(teamwork ?? 0),
    initiative: Number(initiative ?? 0),
    timeManagement: Number(timeManagement ?? 0),
    adaptability: Number(adaptability ?? 0),
    documentation: Number(documentation ?? 0),
  }

  if (!internId || !normalizedWeek) {
    return NextResponse.json({ error: "Practicante y semana requeridos" }, { status: 400 })
  }

  // Verify intern belongs to mentor
  const intern = await prisma.intern.findFirst({
    where: { id: internId, mentorId: session.user.id },
  })
  if (!intern) {
    return NextResponse.json({ error: "Practicante no encontrado" }, { status: 404 })
  }

  // Check duplicate
  const existing = await prisma.weeklyEvaluation.findFirst({
    where: { internId, weekNumber },
  })
  if (existing) {
    return NextResponse.json({ error: "Ya existe una evaluación para esta semana" }, { status: 409 })
  }

  // ─── Compute averages & legacy column values ────────────────────────────────
  let techAvg: number
  let softAvg: number
  let overallAvg: number
  let legacyTech: Record<string, number>
  let legacySoft: Record<string, number>

  if (skillsData?.tech?.length && skillsData?.soft?.length) {
    // Use dynamic skills data
    const techItems: SkillItem[] = skillsData.tech
    const softItems: SkillItem[] = skillsData.soft
    techAvg = avgFromSkills(techItems)
    softAvg = avgFromSkills(softItems)
    overallAvg = techAvg * 0.6 + softAvg * 0.4
    // Map first N to legacy columns
    legacyTech = Object.fromEntries(
      TECH_KEYS.map((k, i) => [k, techItems[i]?.score ?? 3])
    )
    legacySoft = Object.fromEntries(
      SOFT_KEYS.map((k, i) => [k, softItems[i]?.score ?? 3])
    )
  } else {
    // Fallback: legacy individual fields
    const techScores: import("@/types").TechScores = {
      codeQuality: coerced.codeQuality ?? 3,
      problemSolving: coerced.problemSolving ?? 3,
      gitUsage: coerced.gitUsage ?? 3,
      tooling: coerced.tooling ?? 3,
      codeReview: coerced.codeReview ?? 3,
      architecture: coerced.architecture ?? 3,
    }
    const softScores: import("@/types").SoftScores = {
      communication: coerced.communication ?? 3,
      teamwork: coerced.teamwork ?? 3,
      initiative: coerced.initiative ?? 3,
      timeManagement: coerced.timeManagement ?? 3,
      adaptability: coerced.adaptability ?? 3,
      documentation: coerced.documentation ?? 3,
    }
    const averages = calculateWeeklyAverages(techScores, softScores)
    techAvg = averages.techAverage
    softAvg = averages.softAverage
    overallAvg = averages.overallAverage
    legacyTech = techScores as unknown as Record<string, number>
    legacySoft = softScores as unknown as Record<string, number>
  }

  const roundedTechAvg = Math.round(techAvg * 100) / 100
  const roundedSoftAvg = Math.round(softAvg * 100) / 100
  const roundedOverallAvg = Math.round(overallAvg * 100) / 100

  // Calculate weekStart and weekEnd from weekNumber
  const internData = await prisma.intern.findUnique({ where: { id: internId }, select: { startDate: true } })
  const baseDate = internData?.startDate ?? new Date()
  const weekStart = new Date(baseDate)
  weekStart.setDate(weekStart.getDate() + (Number(normalizedWeek) - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Build create data (using `any` to allow skillsData Json field alongside legacy columns)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evalCreateData: any = {
    internId,
    evaluatedBy: session.user.id,
    weekNumber: Number(normalizedWeek),
    weekStart,
    weekEnd,
    codeQuality:    legacyTech["codeQuality"]    ?? 3,
    problemSolving: legacyTech["problemSolving"] ?? 3,
    gitUsage:       legacyTech["gitUsage"]       ?? 3,
    tooling:        legacyTech["tooling"]        ?? 3,
    codeReview:     legacyTech["codeReview"]     ?? 3,
    architecture:   legacyTech["architecture"]   ?? 3,
    communication:  legacySoft["communication"]  ?? 3,
    teamwork:       legacySoft["teamwork"]       ?? 3,
    initiative:     legacySoft["initiative"]     ?? 3,
    timeManagement: legacySoft["timeManagement"] ?? 3,
    adaptability:   legacySoft["adaptability"]   ?? 3,
    documentation:  legacySoft["documentation"]  ?? 3,
    techAverage: roundedTechAvg,
    softAverage: roundedSoftAvg,
    overallAverage: roundedOverallAvg,
    strengths: strengths ?? "",
    improvements: improvements ?? "",
    goals: goals ?? "",
    skillsData: skillsData ?? null,
    relatedGoals: relatedGoalIds?.length
      ? {
          create: relatedGoalIds.map((g: any) => ({
            goalId: typeof g === "string" ? g : g.goalId,
            progressNote: typeof g === "object" ? g.progressNote : undefined,
          })),
        }
      : undefined,
  }

    const evaluation = await prisma.weeklyEvaluation.create({ data: evalCreateData })

    // Update intern overall score (average of all evaluations)
    const allEvals = await prisma.weeklyEvaluation.findMany({
      where: { internId },
    })
    const avgOverall =
      allEvals.reduce((acc, e) => acc + Number(e.overallAverage), 0) / allEvals.length
    const currentWeek = Math.max(...allEvals.map((e: { weekNumber: number }) => e.weekNumber))

    await prisma.intern.update({
      where: { id: internId },
      data: {
        overallScore: avgOverall,
        currentWeek,
      },
    })

    return NextResponse.json({ evaluation }, { status: 201 })
  } catch (err: unknown) {
    // Provide error details for debugging (remove or simplify in production)
    const message = err instanceof Error ? err.message : String(err)
    console.error("[api/evaluations] POST error:", err)
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 })
  }
}
