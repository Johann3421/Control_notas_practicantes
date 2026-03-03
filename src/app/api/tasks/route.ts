import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const taskId = req.nextUrl.searchParams.get("id")

  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { intern: { include: { user: true } } },
    })
    return NextResponse.json({ task })
  }

  // Get all tasks for mentor's interns
  const tasks = await prisma.task.findMany({
    where: { intern: { mentorId: session.user.id } },
    include: { intern: { include: { user: true } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  })

  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, internId, type, priority, dueDate } = body

  if (!title || !internId) {
    return NextResponse.json({ error: "Título y practicante requeridos" }, { status: 400 })
  }

  // Verify intern belongs to mentor
  const intern = await prisma.intern.findFirst({
    where: { id: internId, mentorId: session.user.id },
  })
  if (!intern) {
    return NextResponse.json({ error: "Practicante no encontrado" }, { status: 404 })
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      internId,
      type: type ?? "FEATURE",
      priority: priority ?? "MEDIUM",
      status: "TODO",
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedBy: session.user.id,
    },
  })

  return NextResponse.json({ task }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const taskId = req.nextUrl.searchParams.get("id")
  if (!taskId) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const body = await req.json()
  const { title, description, type, priority, status, dueDate } = body

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
  })

  return NextResponse.json({ task })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const taskId = req.nextUrl.searchParams.get("id")
  if (!taskId) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  await prisma.task.delete({ where: { id: taskId } })

  return NextResponse.json({ deleted: true })
}
