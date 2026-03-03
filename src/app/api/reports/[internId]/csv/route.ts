import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateAttendanceRate, TECH_SKILLS, SOFT_SKILLS } from "@/lib/scoring"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ internId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { internId } = await params

  const intern = await prisma.intern.findUnique({
    where: { id: internId },
    include: {
      user: true,
      mentor: true,
      evaluations: { orderBy: { weekNumber: "asc" } },
      attendance: { orderBy: { date: "asc" } },
      tasks: true,
      learningGoals: true,
    },
  })

  if (!intern) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const _attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
  const tasksCompleted = intern.tasks.filter((t: { status: string }) => t.status === "DONE").length
  const _taskCompletion = intern.tasks.length > 0 ? Math.round((tasksCompleted / intern.tasks.length) * 100) : 0

  // Build CSV rows
  const headers = [
    "Semana",
    ...TECH_SKILLS.map((s) => s.label),
    "Tech Avg",
    ...SOFT_SKILLS.map((s) => s.label),
    "Soft Avg",
    "Overall",
  ]

  const rows = intern.evaluations.map((ev: Record<string, unknown> & { weekNumber: number }) => [
    ev.weekNumber,
    Number(ev.codeQuality),
    Number(ev.problemSolving),
    Number(ev.gitUsage),
    Number(ev.tooling),
    Number(ev.codeReview),
    Number(ev.architecture),
    Number(ev.techAverage).toFixed(2),
    Number(ev.communication),
    Number(ev.teamwork),
    Number(ev.initiative),
    Number(ev.timeManagement),
    Number(ev.adaptability),
    Number(ev.documentation),
    Number(ev.softAverage).toFixed(2),
    Number(ev.overallAverage).toFixed(2),
  ])

  const csv = [headers.join(","), ...rows.map((r: (string | number)[]) => r.join(","))].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${intern.code}_report.csv"`,
    },
  })
}
