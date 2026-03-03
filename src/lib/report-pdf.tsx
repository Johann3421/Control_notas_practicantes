import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    fontSize: 10,
    color: "#222222",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
  },
  headerLeft: { flex: 1 },
  brand: { fontSize: 9, color: "#6366f1", fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#111827", marginTop: 2 },
  subtitle: { fontSize: 10, color: "#6b7280", marginTop: 3 },
  dateText: { fontSize: 8, color: "#9ca3af", textAlign: "right", marginTop: 4 },
  // Info grid
  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20, gap: 4 },
  infoRow: { flexDirection: "row", width: "50%", marginBottom: 5 },
  infoLabel: { fontSize: 9, color: "#9ca3af", width: 80 },
  infoValue: { fontSize: 9, color: "#111827", flex: 1 },
  // Section
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  // Stats cards row
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  statCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#6366f1" },
  statValueGreen: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#10b981" },
  statValueAmber: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#f59e0b" },
  statValuePurple: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#8b5cf6" },
  statLabel: { fontSize: 7, color: "#9ca3af", marginTop: 2, textAlign: "center" },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: "6 8",
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "6 8",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "6 8",
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  thCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280" },
  tdCell: { fontSize: 9, color: "#374151" },
  tdCellBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  w20: { width: "20%" },
  w25: { width: "25%" },
  w30: { width: "30%" },
  w40: { width: "40%" },
  w50: { width: "50%" },
  w15: { width: "15%" },
  w10: { width: "10%" },
  // Progress bar
  progressBg: { height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, flex: 1, marginTop: 6 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: "#6366f1" },
  // Goals
  goalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  goalDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  goalTitle: { fontSize: 9, color: "#374151", flex: 1 },
  goalCategory: { fontSize: 8, color: "#9ca3af", width: 70, textAlign: "right" },
  goalStatus: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 70, textAlign: "right" },
  // Recommendation badge
  badge: {
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    padding: "3 10",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#7c3aed" },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: "#d1d5db" },
})

// ─── Types ───────────────────────────────────────────────────────────────────
export interface InternReportData {
  intern: {
    code: string
    university: string | null
    stack: string[]
    overallScore: number
    user: { name: string; email: string }
    mentor: { name: string } | null
    evaluations: Array<{
      weekNumber: number
      techAverage: unknown
      softAverage: unknown
      overallAverage: unknown
    }>
    learningGoals: Array<{
      title: string
      category: string
      status: string
    }>
    tasks: Array<{ status: string }>
    attendance: Array<{ status: string }>
  }
  attendanceRate: number
  tasksCompleted: number
  promotion: string
}

// ─── Progress Bar helper ─────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color ?? "#6366f1" }]} />
    </View>
  )
}

// ─── PDF Document component ───────────────────────────────────────────────────
function InternReportDocument({ intern, attendanceRate, tasksCompleted, promotion }: InternReportData) {
  const taskCount = intern.tasks.length
  const taskPct = taskCount > 0 ? Math.round((tasksCompleted / taskCount) * 100) : 0
  const scorePct = (intern.overallScore / 20) * 100

  const statusColors: Record<string, string> = {
    COMPLETED: "#10b981",
    IN_PROGRESS: "#6366f1",
    NOT_STARTED: "#d1d5db",
  }
  const statusLabel: Record<string, string> = {
    COMPLETED: "Completado",
    IN_PROGRESS: "En Progreso",
    NOT_STARTED: "Pendiente",
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brand}>DEVTRACK</Text>
            <Text style={styles.title}>{intern.user.name}</Text>
            <Text style={styles.subtitle}>Reporte de Desempeño — {intern.code}</Text>
          </View>
          <Text style={styles.dateText}>Generado:{"\n"}{new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</Text>
        </View>

        {/* ── Info General ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{intern.user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mentor:</Text>
              <Text style={styles.infoValue}>{intern.mentor?.name ?? "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Universidad:</Text>
              <Text style={styles.infoValue}>{intern.university ?? "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stack:</Text>
              <Text style={styles.infoValue}>{intern.stack.join(", ")}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Desempeño</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{intern.overallScore.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Score General / 20.0</Text>
              <ProgressBar value={scorePct} max={100} color="#6366f1" />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueGreen}>{attendanceRate}%</Text>
              <Text style={styles.statLabel}>Asistencia</Text>
              <ProgressBar value={attendanceRate} max={100} color="#10b981" />
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValueAmber}>{taskPct}%</Text>
              <Text style={styles.statLabel}>Tareas ({tasksCompleted}/{taskCount})</Text>
              <ProgressBar value={taskPct} max={100} color="#f59e0b" />
            </View>
            <View style={styles.statCard}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{promotion}</Text>
              </View>
              <Text style={[styles.statLabel, { marginTop: 6 }]}>Recomendación</Text>
            </View>
          </View>
        </View>

        {/* ── Evaluaciones ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluaciones Semanales</Text>
          {intern.evaluations.length === 0 ? (
            <Text style={{ fontSize: 9, color: "#9ca3af" }}>Sin evaluaciones registradas.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.thCell, styles.w20]}>Semana</Text>
                <Text style={[styles.thCell, styles.w25]}>Tech Avg</Text>
                <Text style={[styles.thCell, styles.w25]}>Soft Avg</Text>
                <Text style={[styles.thCell, styles.w30]}>Overall</Text>
              </View>
              {intern.evaluations.map((ev, i) => (
                <View key={ev.weekNumber} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tdCell, styles.w20]}>Semana {ev.weekNumber}</Text>
                  <Text style={[styles.tdCell, styles.w25]}>{Number(ev.techAverage).toFixed(2)}</Text>
                  <Text style={[styles.tdCell, styles.w25]}>{Number(ev.softAverage).toFixed(2)}</Text>
                  <Text style={[styles.tdCellBold, styles.w30]}>{Number(ev.overallAverage).toFixed(2)}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ── Objetivos ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos de Aprendizaje</Text>
          {intern.learningGoals.length === 0 ? (
            <Text style={{ fontSize: 9, color: "#9ca3af" }}>Sin objetivos definidos.</Text>
          ) : (
            intern.learningGoals.map((g, i) => (
              <View key={i} style={styles.goalRow}>
                <View style={[styles.goalDot, { backgroundColor: statusColors[g.status] ?? "#d1d5db" }]} />
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={styles.goalCategory}>{g.category}</Text>
                <Text style={[styles.goalStatus, { color: statusColors[g.status] ?? "#9ca3af" }]}>
                  {statusLabel[g.status] ?? g.status}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>DevTrack — Reporte de Practicante</Text>
          <Text style={styles.footerText}>{intern.code} • {new Date().toLocaleString("es-MX")}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Helper: build Buffer ────────────────────────────────────────────────────
export async function buildPDFBuffer(data: InternReportData): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InternReportDocument, data) as any
  const buffer = await renderToBuffer(element)
  return new Uint8Array(buffer)
}
