import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
  })

  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { name, currentPassword, newPassword } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
  }

  const updateData: { name: string; password?: string } = { name: name.trim() }

  // If changing password, verify current one
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Ingresa tu contraseña actual para cambiarla" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    const valid = await bcrypt.compare(currentPassword, user?.password ?? "")
    if (!valid) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ user: updated })
}
