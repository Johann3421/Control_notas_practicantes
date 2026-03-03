import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Pool } from "pg"

/**
 * POST /api/attendance/fix-dates
 *
 * One-time correction: shifts ALL attendance_records dates back by 1 day.
 * Background: a UTC/local timezone bug caused dates saved by the mentor to be
 * stored as the NEXT calendar day (e.g. Monday saved as Tuesday).
 * This endpoint corrects the existing data.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const confirm = searchParams.get("confirm")

  // Use pg Pool directly to run raw SQL (avoids Prisma proxy this-binding issue with $executeRaw)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  try {
    // Dry-run: return count without modifying
    if (confirm !== "yes") {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM attendance_records`)
      const count = Number(countResult.rows[0]?.count ?? 0)
      await pool.end()
      return NextResponse.json({
        message: `Se corregirían ${count} registro(s). Pasa ?confirm=yes para aplicar.`,
        count,
      })
    }

    const result = await pool.query(
      `UPDATE attendance_records SET date = date - INTERVAL '1 day'`
    )
    return NextResponse.json({
      success: true,
      updated: result.rowCount,
      message: `Fechas corregidas: ${result.rowCount} registro(s) actualizados correctamente.`,
    })
  } finally {
    await pool.end().catch(() => {})
  }
}
