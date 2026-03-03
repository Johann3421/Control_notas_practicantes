import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/interns/[id]/promotion  — manually override promotion recommendation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const { promotionRecommendation } = await req.json()

  const validStatuses = ["PROMOTED", "EXTENDED", "GRADUATED", "NOT_RECOMMENDED"]
  if (promotionRecommendation !== null && !validStatuses.includes(promotionRecommendation)) {
    return NextResponse.json({ error: "Estado de recomendación inválido" }, { status: 400 })
  }

  // Verify ownership
  const intern = await prisma.intern.findFirst({
    where: {
      id,
      ...(session.user.role === "MENTOR" ? { mentorId: session.user.id } : {}),
    },
  })
  if (!intern) return NextResponse.json({ error: "Practicante no encontrado" }, { status: 404 })

  const updated = await prisma.intern.update({
    where: { id },
    data: { promotionRecommendation: promotionRecommendation ?? null },
  })

  return NextResponse.json({ ok: true, promotionRecommendation: updated.promotionRecommendation })
}
