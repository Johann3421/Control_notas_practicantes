import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateAttendanceRate, getPromotionRecommendation } from "@/lib/scoring"
import { buildPDFBuffer } from "@/lib/report-pdf"

// Force Node.js runtime (required for @react-pdf/renderer)
export const runtime = "nodejs"

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
      attendance: true,
      tasks: true,
      learningGoals: true,
    },
  })

  if (!intern) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
  const tasksCompleted = intern.tasks.filter((t: { status: string }) => t.status === "DONE").length
  const taskCompletion = intern.tasks.length > 0 ? Math.round((tasksCompleted / intern.tasks.length) * 100) : 0
  const autoPromotion = getPromotionRecommendation(Number(intern.overallScore), attendanceRate, taskCompletion)
  const promotion = (intern.promotionRecommendation as string | null) ?? autoPromotion

  const pdfBuffer = await buildPDFBuffer({
    intern: {
      code: intern.code,
      university: intern.university,
      stack: intern.stack as string[],
      overallScore: Number(intern.overallScore),
      user: { name: intern.user.name!, email: intern.user.email! },
      mentor: intern.mentor ? { name: intern.mentor.name! } : null,
      evaluations: intern.evaluations,
      learningGoals: intern.learningGoals as Array<{ title: string; category: string; status: string }>,
      tasks: intern.tasks as Array<{ status: string }>,
      attendance: intern.attendance as Array<{ status: string }>,
    },
    attendanceRate,
    tasksCompleted,
    promotion,
  })

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${intern.code}_report.pdf"`,
    },
  })
}
