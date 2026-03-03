import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const evaluation = await prisma.weeklyEvaluation.findUnique({
    where: { id },
    include: {
      intern: { include: { user: true } },
      relatedGoals: { include: { goal: true } },
    },
  })

  if (!evaluation) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  }

  return NextResponse.json({ evaluation })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const evaluation = await prisma.weeklyEvaluation.findUnique({
    where: { id },
    select: { evaluatedBy: true },
  })

  if (!evaluation) {
    return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
  }

  if (session.user.role === "MENTOR" && evaluation.evaluatedBy !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  await prisma.weeklyEvaluation.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
