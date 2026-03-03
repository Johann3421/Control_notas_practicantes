import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const date = req.nextUrl.searchParams.get("date")
  if (!date) return NextResponse.json({ error: "Fecha requerida" }, { status: 400 })

  const targetDate = new Date(date)

  const interns = await prisma.intern.findMany({
    where: { mentorId: session.user.id, status: "ACTIVE" },
    include: {
      user: { select: { name: true } },
      attendance: {
        where: { date: targetDate },
        take: 1,
      },
    },
    orderBy: { user: { name: "asc" } },
  })

  const rows = interns.map((intern) => {
    const record = intern.attendance[0]
    return {
      internId: intern.id,
      internName: intern.user.name ?? "—",
      internCode: intern.code,
      status: record?.status ?? "PRESENT",
      checkIn: record?.checkIn ?? "",
      checkOut: record?.checkOut ?? "",
      lateMinutes: record?.lateMinutes ?? 0,
      hoursWorked: record ? Number(record.hoursWorked) : 0,
      notes: record?.notes ?? "",
      saved: !!record,
    }
  })

  return NextResponse.json({ rows })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const { date, records } = body as {
    date: string
    records: Array<{
      internId: string
      status: string
      checkIn: string
      checkOut: string
      lateMinutes: number
      hoursWorked: number
      notes: string
    }>
  }

  if (!date || !records?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const targetDate = new Date(date)

  const results = await Promise.all(
    records.map((record) =>
      prisma.attendanceRecord.upsert({
        where: {
          internId_date: {
            internId: record.internId,
            date: targetDate,
          },
        },
        update: {
          status: record.status as "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED_ABSENCE" | "HOLIDAY",
          checkIn: record.checkIn || null,
          checkOut: record.checkOut || null,
          lateMinutes: record.lateMinutes,
          hoursWorked: record.hoursWorked,
          notes: record.notes || null,
          recordedBy: session.user.id,
        },
        create: {
          internId: record.internId,
          date: targetDate,
          status: record.status as "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED_ABSENCE" | "HOLIDAY",
          checkIn: record.checkIn || null,
          checkOut: record.checkOut || null,
          lateMinutes: record.lateMinutes,
          hoursWorked: record.hoursWorked,
          notes: record.notes || null,
          recordedBy: session.user.id,
        },
      })
    )
  )

  return NextResponse.json({ saved: results.length })
}
