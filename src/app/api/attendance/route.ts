import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/** Parse "YYYY-MM-DD" as a local-midnight Date to avoid UTC offset shifting the day */
function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Build a full DateTime from a date string ("YYYY-MM-DD") and time string ("HH:mm" or "") */
function buildDateTime(dateStr: string, timeStr: string | null | undefined): Date | null {
  if (!timeStr || !timeStr.trim()) return null
  const [h, m] = timeStr.trim().split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return null
  const d = parseDateLocal(dateStr)
  d.setHours(h, m, 0, 0)
  return d
}

/** Extract "HH:mm" from a Date (or ISO string) stored in the DB */
function toTimeString(dt: Date | string | null | undefined): string {
  if (!dt) return ""
  const d = typeof dt === "string" ? new Date(dt) : dt
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const date = req.nextUrl.searchParams.get("date")
  if (!date) return NextResponse.json({ error: "Fecha requerida" }, { status: 400 })

  const targetDate = parseDateLocal(date)

  const interns = await prisma.intern.findMany({
    where: {
      status: "ACTIVE",
      // ADMIN sees all interns; MENTOR only sees their own
      ...(session.user.role === "ADMIN" ? {} : { mentorId: session.user.id }),
    },
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
      // Use clockIn/clockOut to match the grid component field names
      clockIn: toTimeString(record?.checkIn),
      clockOut: toTimeString(record?.checkOut),
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
      clockIn: string
      clockOut: string
      lateMinutes: number
      hoursWorked: number
      notes: string
    }>
  }

  if (!date || !records?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const targetDate = parseDateLocal(date)

  const results = await Promise.all(
    records.map((record) => {
      const checkIn = buildDateTime(date, record.clockIn)
      const checkOut = buildDateTime(date, record.clockOut)

      // Auto-calculate hours worked from checkIn/checkOut when not manually set
      let hoursWorked = record.hoursWorked
      if (checkIn && checkOut && !hoursWorked) {
        hoursWorked = Math.round(((checkOut.getTime() - checkIn.getTime()) / 3_600_000) * 100) / 100
      }

      const data = {
        status: record.status as "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED_ABSENCE" | "HOLIDAY",
        checkIn,
        checkOut,
        lateMinutes: record.lateMinutes ?? 0,
        hoursWorked: hoursWorked ?? 0,
        notes: record.notes || null,
        recordedBy: session.user.id,
      }

      return prisma.attendanceRecord.upsert({
        where: { internId_date: { internId: record.internId, date: targetDate } },
        update: data,
        create: { internId: record.internId, date: targetDate, ...data },
      })
    })
  )

  return NextResponse.json({ saved: results.length })
}

