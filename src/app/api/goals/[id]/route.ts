import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/goals/[id]  — update a goal
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  // Verify the goal's intern belongs to this mentor
  const existing = await prisma.learningGoal.findUnique({
    where: { id },
    include: { intern: true },
  })
  if (!existing) return NextResponse.json({ error: "Objetivo no encontrado" }, { status: 404 })
  if (session.user.role === "MENTOR" && existing.intern.mentorId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { title, description, category, priority, targetWeek, status, technology, completedAt, notes } = body

  const goal = await prisma.learningGoal.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(priority !== undefined && { priority }),
      ...(targetWeek !== undefined && { targetWeek: Number(targetWeek) }),
      ...(status !== undefined && { status }),
      ...(technology !== undefined && { technology }),
      ...(notes !== undefined && { notes }),
      ...(status === "COMPLETED" && !existing.completedAt
        ? { completedAt: completedAt ? new Date(completedAt) : new Date() }
        : {}),
    },
  })

  return NextResponse.json({ goal })
}

// DELETE /api/goals/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.learningGoal.findUnique({
    where: { id },
    include: { intern: true },
  })
  if (!existing) return NextResponse.json({ error: "Objetivo no encontrado" }, { status: 404 })
  if (session.user.role === "MENTOR" && existing.intern.mentorId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  await prisma.learningGoal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
