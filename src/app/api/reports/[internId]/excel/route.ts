import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateAttendanceRate, getPromotionRecommendation, TECH_SKILLS, SOFT_SKILLS } from "@/lib/scoring"
import ExcelJS from "exceljs"

export const runtime = "nodejs"

// ─── Color helpers ───────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 18) return "FF10B981" // green
  if (score >= 14) return "FF6366F1" // indigo
  if (score >= 10) return "FFF59E0B" // amber
  return "FFEF4444" // red
}
function pctColor(pct: number): string {
  if (pct >= 90) return "FF10B981"
  if (pct >= 70) return "FF6366F1"
  if (pct >= 50) return "FFF59E0B"
  return "FFEF4444"
}

// ─── Style helpers ───────────────────────────────────────────────────────────
type WSheet = ExcelJS.Worksheet

function headerCell(ws: WSheet, row: number, col: number, value: string, bg = "FF6366F1", textColor = "FFFFFFFF") {
  const cell = ws.getCell(row, col)
  cell.value = value
  cell.font = { bold: true, color: { argb: textColor }, size: 10 }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } }
  cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
  cell.border = {
    top: { style: "thin", color: { argb: "FFE5E7EB" } },
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } },
  }
}
function dataCell(ws: WSheet, row: number, col: number, value: ExcelJS.CellValue, align: "left" | "center" | "right" = "center") {
  const cell = ws.getCell(row, col)
  cell.value = value
  cell.font = { size: 10 }
  cell.alignment = { vertical: "middle", horizontal: align }
  cell.border = {
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } },
  }
}
function coloredScoreCell(ws: WSheet, row: number, col: number, score: number) {
  const cell = ws.getCell(row, col)
  cell.value = Number(score.toFixed(2))
  cell.font = { bold: true, size: 10, color: { argb: scoreColor(score) } }
  cell.alignment = { vertical: "middle", horizontal: "center" }
  cell.border = {
    bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    left: { style: "thin", color: { argb: "FFE5E7EB" } },
    right: { style: "thin", color: { argb: "FFE5E7EB" } },
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ internId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { internId } = await params

  const intern = await prisma.intern.findUnique({
    where: { id: internId },
    include: {
      user: true,
      mentor: true,
      evaluations: { orderBy: { weekNumber: "asc" } },
      attendance: { orderBy: { date: "asc" } },
      tasks: true,
      learningGoals: true,
    },
  })

  if (!intern) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  const attendanceRate = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
  const tasksCompleted = intern.tasks.filter((t: { status: string }) => t.status === "DONE").length
  const taskPct = intern.tasks.length > 0 ? Math.round((tasksCompleted / intern.tasks.length) * 100) : 0
  const autoPromotion = getPromotionRecommendation(Number(intern.overallScore), attendanceRate, taskPct)
  const promotion = (intern.promotionRecommendation as string | null) ?? autoPromotion

  const wb = new ExcelJS.Workbook()
  wb.creator = "DevTrack"
  wb.created = new Date()

  // ── Sheet 1: Resumen ────────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("Resumen", { properties: { tabColor: { argb: "FF6366F1" } } })
  ws1.views = [{ showGridLines: false }]

  // Title block
  ws1.mergeCells("A1:F1")
  const titleCell = ws1.getCell("A1")
  titleCell.value = "DEVTRACK — REPORTE DE PRACTICANTE"
  titleCell.font = { bold: true, size: 18, color: { argb: "FF6366F1" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  ws1.getRow(1).height = 36

  ws1.mergeCells("A2:F2")
  const subtitleCell = ws1.getCell("A2")
  subtitleCell.value = `${intern.user.name}  ·  ${intern.code}  ·  Generado: ${new Date().toLocaleDateString("es-MX")}`
  subtitleCell.font = { size: 11, color: { argb: "FF6B7280" } }
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" }
  ws1.getRow(2).height = 22

  ws1.addRow([]) // spacer

  // Info rows
  const infoFields: [string, string][] = [
    ["Email", intern.user.email!],
    ["Universidad", intern.university ?? "N/A"],
    ["Stack", (intern.stack as string[]).join(", ")],
    ["Mentor", intern.mentor?.name ?? "N/A"],
  ]
  for (const [label, val] of infoFields) {
    const r = ws1.addRow([label, val])
    r.getCell(1).font = { bold: true, color: { argb: "FF9CA3AF" }, size: 10 }
    r.getCell(2).font = { size: 10 }
    r.height = 18
  }
  ws1.addRow([])

  // Metrics header
  const metricsHeaderRow = ws1.rowCount + 1
  headerCell(ws1, metricsHeaderRow, 1, "Métrica")
  headerCell(ws1, metricsHeaderRow, 2, "Valor")
  ws1.getRow(metricsHeaderRow).height = 22

  const metrics: [string, string | number][] = [
    ["Score General (/ 20.0)", Number(intern.overallScore).toFixed(2)],
    ["Asistencia", `${attendanceRate}%`],
    ["Tareas Completadas", `${tasksCompleted} / ${intern.tasks.length}  (${taskPct}%)`],
    ["Objetivos Completados", `${intern.learningGoals.filter((g: { status: string }) => g.status === "COMPLETED").length} / ${intern.learningGoals.length}`],
    ["Recomendación", promotion],
  ]
  for (const [label, val] of metrics) {
    const r = ws1.rowCount + 1
    dataCell(ws1, r, 1, label, "left")
    dataCell(ws1, r, 2, String(val), "center")
    ws1.getRow(r).height = 18
  }

  ws1.getColumn(1).width = 28
  ws1.getColumn(2).width = 36

  // ── Sheet 2: Evaluaciones ───────────────────────────────────────────────────
  const ws2 = wb.addWorksheet("Evaluaciones", { properties: { tabColor: { argb: "FF10B981" } } })
  ws2.views = [{ showGridLines: false }]

  // Title
  ws2.mergeCells("A1:P1")
  const t2 = ws2.getCell("A1")
  t2.value = "Evaluaciones Semanales"
  t2.font = { bold: true, size: 14, color: { argb: "FF111827" } }
  t2.alignment = { horizontal: "left", vertical: "middle" }
  ws2.getRow(1).height = 30

  // Header row
  const evalHeaders = [
    "Semana",
    ...TECH_SKILLS.map((s) => s.label),
    "Tech Avg",
    ...SOFT_SKILLS.map((s) => s.label),
    "Soft Avg",
    "Overall",
  ]
  const hr = ws2.rowCount + 1
  evalHeaders.forEach((h, i) => {
    const bg = i === 0 ? "FF374151" : i <= TECH_SKILLS.length ? "FF1E40AF" : i === TECH_SKILLS.length + 1 ? "FF065F46" : i <= TECH_SKILLS.length + 1 + SOFT_SKILLS.length ? "FF065F46" : "FF7C3AED"
    headerCell(ws2, hr, i + 1, h, bg)
  })
  ws2.getRow(hr).height = 36

  // Data rows
  type EvalRecord = Record<string, unknown> & { weekNumber: number }
  for (const ev of intern.evaluations as EvalRecord[]) {
    const r = ws2.rowCount + 1
    dataCell(ws2, r, 1, `Semana ${ev.weekNumber}`, "center")
    // Tech skills
    TECH_SKILLS.forEach((s, i) => {
      coloredScoreCell(ws2, r, i + 2, Number(ev[s.key]))
    })
    coloredScoreCell(ws2, r, TECH_SKILLS.length + 2, Number(ev.techAverage))
    // Soft skills
    SOFT_SKILLS.forEach((s, i) => {
      coloredScoreCell(ws2, r, TECH_SKILLS.length + 3 + i, Number(ev[s.key]))
    })
    coloredScoreCell(ws2, r, TECH_SKILLS.length + SOFT_SKILLS.length + 3, Number(ev.softAverage))
    coloredScoreCell(ws2, r, TECH_SKILLS.length + SOFT_SKILLS.length + 4, Number(ev.overallAverage))
    ws2.getRow(r).height = 20
  }

  // Column widths
  ws2.getColumn(1).width = 12
  for (let c = 2; c <= evalHeaders.length; c++) ws2.getColumn(c).width = 16

  // ── Sheet 3: Asistencia ─────────────────────────────────────────────────────
  const ws3 = wb.addWorksheet("Asistencia", { properties: { tabColor: { argb: "FFF59E0B" } } })
  ws3.views = [{ showGridLines: false }]

  ws3.mergeCells("A1:D1")
  const t3 = ws3.getCell("A1")
  t3.value = "Registros de Asistencia"
  t3.font = { bold: true, size: 14, color: { argb: "FF111827" } }
  t3.alignment = { horizontal: "left", vertical: "middle" }
  ws3.getRow(1).height = 30

  const attHeaders = ["Fecha", "Estado", "Entrada", "Salida", "Horas", "Minutos Tarde"]
  attHeaders.forEach((h, i) => headerCell(ws3, 2, i + 1, h, "FF374151"))
  ws3.getRow(2).height = 22

  const attStatusLabel: Record<string, string> = { PRESENT: "Presente", LATE: "Tarde", ABSENT: "Ausente" }
  const attStatusColor: Record<string, string> = { PRESENT: "FF10B981", LATE: "FFF59E0B", ABSENT: "FFEF4444" }

  type AttRecord = { date: Date; status: string; checkIn: Date | null; checkOut: Date | null; hoursWorked: unknown; lateMinutes: unknown }
  for (const att of intern.attendance as AttRecord[]) {
    const r = ws3.rowCount + 1
    dataCell(ws3, r, 1, att.date.toLocaleDateString("es-MX"), "center")
    const statusCell = ws3.getCell(r, 2)
    statusCell.value = attStatusLabel[att.status] ?? att.status
    statusCell.font = { bold: true, size: 10, color: { argb: attStatusColor[att.status] ?? "FF374151" } }
    statusCell.alignment = { horizontal: "center", vertical: "middle" }
    dataCell(ws3, r, 3, att.checkIn ? att.checkIn.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—", "center")
    dataCell(ws3, r, 4, att.checkOut ? att.checkOut.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—", "center")
    dataCell(ws3, r, 5, Number(att.hoursWorked), "center")
    dataCell(ws3, r, 6, Number(att.lateMinutes), "center")
    ws3.getRow(r).height = 18
  }

  // Summary total row
  const totR = ws3.rowCount + 2
  const totCell = ws3.getCell(totR, 1)
  totCell.value = `Tasa de asistencia: ${attendanceRate}%`
  totCell.font = { bold: true, size: 11 }
  ws3.getRow(totR).height = 20

  ws3.getColumn(1).width = 16
  ws3.getColumn(2).width = 14
  ws3.getColumn(3).width = 12
  ws3.getColumn(4).width = 12
  ws3.getColumn(5).width = 10
  ws3.getColumn(6).width = 14

  // ── Sheet 4: Objetivos ──────────────────────────────────────────────────────
  const ws4 = wb.addWorksheet("Objetivos", { properties: { tabColor: { argb: "FF8B5CF6" } } })
  ws4.views = [{ showGridLines: false }]

  ws4.mergeCells("A1:D1")
  const t4 = ws4.getCell("A1")
  t4.value = "Objetivos de Aprendizaje"
  t4.font = { bold: true, size: 14, color: { argb: "FF111827" } }
  t4.alignment = { horizontal: "left", vertical: "middle" }
  ws4.getRow(1).height = 30

  const goalHeaders = ["Objetivo", "Categoría", "Prioridad", "Estado"]
  goalHeaders.forEach((h, i) => headerCell(ws4, 2, i + 1, h, "FF374151"))
  ws4.getRow(2).height = 22

  const goalStatusLabel: Record<string, string> = { COMPLETED: "Completado", IN_PROGRESS: "En Progreso", NOT_STARTED: "Pendiente" }
  const goalStatusColor: Record<string, string> = { COMPLETED: "FF10B981", IN_PROGRESS: "FF6366F1", NOT_STARTED: "FF9CA3AF" }

  type GoalRecord = { title: string; category: string; priority: string; status: string }
  for (const g of intern.learningGoals as GoalRecord[]) {
    const r = ws4.rowCount + 1
    dataCell(ws4, r, 1, g.title, "left")
    dataCell(ws4, r, 2, g.category, "center")
    dataCell(ws4, r, 3, g.priority, "center")
    const statusCell = ws4.getCell(r, 4)
    statusCell.value = goalStatusLabel[g.status] ?? g.status
    statusCell.font = { bold: true, size: 10, color: { argb: goalStatusColor[g.status] ?? "FF374151" } }
    statusCell.alignment = { horizontal: "center", vertical: "middle" }
    ws4.getRow(r).height = 18
  }

  ws4.getColumn(1).width = 40
  ws4.getColumn(2).width = 18
  ws4.getColumn(3).width = 14
  ws4.getColumn(4).width = 16

  // ── Sheet 5: Tareas ─────────────────────────────────────────────────────────
  const ws5 = wb.addWorksheet("Tareas", { properties: { tabColor: { argb: "FFEF4444" } } })
  ws5.views = [{ showGridLines: false }]

  ws5.mergeCells("A1:E1")
  const t5 = ws5.getCell("A1")
  t5.value = "Tareas Asignadas"
  t5.font = { bold: true, size: 14, color: { argb: "FF111827" } }
  t5.alignment = { horizontal: "left", vertical: "middle" }
  ws5.getRow(1).height = 30

  const taskHeaders = ["Título", "Tipo", "Prioridad", "Estado", "Vencimiento"]
  taskHeaders.forEach((h, i) => headerCell(ws5, 2, i + 1, h, "FF374151"))
  ws5.getRow(2).height = 22

  const taskStatusLabel: Record<string, string> = { DONE: "Completada", IN_PROGRESS: "En Progreso", IN_REVIEW: "En Revisión", TODO: "Pendiente" }
  const taskStatusColor: Record<string, string> = { DONE: "FF10B981", IN_PROGRESS: "FF6366F1", IN_REVIEW: "FFF59E0B", TODO: "FF9CA3AF" }

  type TaskRecord = { title: string; type: string; priority: string; status: string; dueDate: Date | null }
  for (const t of intern.tasks as TaskRecord[]) {
    const r = ws5.rowCount + 1
    dataCell(ws5, r, 1, t.title, "left")
    dataCell(ws5, r, 2, t.type, "center")
    dataCell(ws5, r, 3, t.priority, "center")
    const statusCell = ws5.getCell(r, 4)
    statusCell.value = taskStatusLabel[t.status] ?? t.status
    statusCell.font = { bold: true, size: 10, color: { argb: taskStatusColor[t.status] ?? "FF374151" } }
    statusCell.alignment = { horizontal: "center", vertical: "middle" }
    dataCell(ws5, r, 5, t.dueDate ? t.dueDate.toLocaleDateString("es-MX") : "—", "center")
    ws5.getRow(r).height = 18
  }

  // Add summary row
  const taskSumR = ws5.rowCount + 2
  ws5.getCell(taskSumR, 1).value = `Completadas: ${tasksCompleted} / ${intern.tasks.length}  (${taskPct}%)`
  ws5.getCell(taskSumR, 1).font = { bold: true, size: 11, color: { argb: pctColor(taskPct) } }
  ws5.getRow(taskSumR).height = 20

  ws5.getColumn(1).width = 36
  ws5.getColumn(2).width = 18
  ws5.getColumn(3).width = 14
  ws5.getColumn(4).width = 16
  ws5.getColumn(5).width = 16

  // ── Serialize ────────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${intern.code}_report.xlsx"`,
    },
  })
}
