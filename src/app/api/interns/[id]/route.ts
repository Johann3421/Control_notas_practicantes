import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const intern = await prisma.intern.findUnique({
    where: { id },
    select: { userId: true, mentorId: true },
  })

  if (!intern) {
    return NextResponse.json({ error: "Practicante no encontrado" }, { status: 404 })
  }

  // Mentors can only delete their own interns; admins can delete any
  if (session.user.role === "MENTOR" && intern.mentorId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // Deleting the User cascades to Intern → attendance, evaluations, tasks, goals
  await prisma.user.delete({ where: { id: intern.userId } })

  return NextResponse.json({ ok: true })
}
