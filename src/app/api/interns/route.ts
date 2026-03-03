import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, password, code, university, stack, startDate } = body

  if (!name || !email || !password || !code) {
    return NextResponse.json({ error: "Campos requeridos: nombre, email, contraseña, código" }, { status: 400 })
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "INTERN",
      internProfile: {
        create: {
          code,
          university: university || null,
          stack: stack ?? [],
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: startDate ? new Date(new Date(startDate).getTime() + 12 * 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          mentorId: session.user.id,
        },
      },
    },
    include: { internProfile: true },
  })

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
}
