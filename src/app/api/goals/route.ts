import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/goals?internId=xxx  — list goals for an intern
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const internId = req.nextUrl.searchParams.get("internId")
  if (!internId) return NextResponse.json({ error: "internId requerido" }, { status: 400 })

  // Verify the intern belongs to this mentor (or user is admin)
  const intern = await prisma.intern.findFirst({
    where: {
      id: internId,
      ...(session.user.role === "MENTOR" ? { mentorId: session.user.id } : {}),
    },
  })
  if (!intern) return NextResponse.json({ error: "Practicante no encontrado" }, { status: 404 })

  const goals = await prisma.learningGoal.findMany({
    where: { internId },
    orderBy: [{ priority: "desc" }, { targetWeek: "asc" }],
  })

  return NextResponse.json({ goals })
}

// POST /api/goals  — create a new goal
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { internId, title, description, category, priority, targetWeek, status, technology } = body

  if (!internId || !title || !category || !priority || !targetWeek) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  // Verify ownership
  const intern = await prisma.intern.findFirst({
    where: {
      id: internId,
      ...(session.user.role === "MENTOR" ? { mentorId: session.user.id } : {}),
    },
  })
  if (!intern) return NextResponse.json({ error: "Practicante no encontrado" }, { status: 404 })

  const goal = await prisma.learningGoal.create({
    data: {
      internId,
      title,
      description: description ?? null,
      category,
      priority,
      targetWeek: Number(targetWeek),
      status: status ?? "NOT_STARTED",
      technology: technology ?? null,
    },
  })

  return NextResponse.json({ goal }, { status: 201 })
}
