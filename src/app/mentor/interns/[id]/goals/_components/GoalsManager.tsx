"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, BarChart3, CheckCircle2, Clock, AlertCircle, SkipForward, Trophy } from "lucide-react"
import Button from "@/components/ui/Button"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Goal {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  targetWeek: number
  technology: string
  notes: string
  completedAt: string | null
}

interface GoalsManagerProps {
  internId: string
  internName: string
  totalWeeks: number
  initialGoals: Goal[]
  currentPromotion: string | null
  autoPromotion: string
  overallScore: number
  attendanceRate: number
  taskCompletion: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "TECHNICAL",  label: "Técnico",         color: "text-electric-400 bg-electric-500/10 border-electric-500/30" },
  { value: "SOFT_SKILL", label: "Habilidad blanda", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  { value: "PROJECT",    label: "Proyecto",         color: "text-neon-400 bg-neon-500/10 border-neon-500/30" },
  { value: "PROCESS",    label: "Proceso",          color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
]

const PRIORITIES = [
  { value: "LOW",      label: "Baja",     color: "text-base-400" },
  { value: "MEDIUM",   label: "Media",    color: "text-amber-400" },
  { value: "HIGH",     label: "Alta",     color: "text-orange-400" },
  { value: "CRITICAL", label: "Crítica",  color: "text-danger-400" },
]

const STATUSES = [
  { value: "NOT_STARTED", label: "Sin empezar",  icon: Clock,          color: "text-base-400" },
  { value: "PENDING",     label: "Pendiente",    icon: AlertCircle,    color: "text-amber-400" },
  { value: "IN_PROGRESS", label: "En progreso",  icon: BarChart3,      color: "text-electric-400" },
  { value: "COMPLETED",   label: "Completado",   icon: CheckCircle2,   color: "text-neon-400" },
  { value: "SKIPPED",     label: "Omitido",      icon: SkipForward,    color: "text-base-500" },
]

const PROMOTIONS = [
  { value: "PROMOTED",         label: "Promovido",         color: "text-neon-400 border-neon-500/40 bg-neon-500/10" },
  { value: "GRADUATED",        label: "Graduado",          color: "text-electric-400 border-electric-500/40 bg-electric-500/10" },
  { value: "EXTENDED",         label: "Extender prácticas", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  { value: "NOT_RECOMMENDED",  label: "No recomendado",    color: "text-danger-400 border-danger-500/40 bg-danger-500/10" },
]

const emptyForm = {
  title: "",
  description: "",
  category: "TECHNICAL",
  priority: "MEDIUM",
  status: "NOT_STARTED",
  targetWeek: 1,
  technology: "",
  notes: "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function categoryInfo(val: string) {
  return CATEGORIES.find((c) => c.value === val) ?? CATEGORIES[0]
}
function priorityInfo(val: string) {
  return PRIORITIES.find((p) => p.value === val) ?? PRIORITIES[1]
}
function statusInfo(val: string) {
  return STATUSES.find((s) => s.value === val) ?? STATUSES[0]
}
function promotionInfo(val: string | null) {
  return PROMOTIONS.find((p) => p.value === val) ?? null
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GoalsManager({
  internId, totalWeeks, initialGoals,
  currentPromotion, autoPromotion,
  overallScore, attendanceRate, taskCompletion,
}: GoalsManagerProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Goal>>({})
  const [promotion, setPromotion] = useState<string | null>(currentPromotion)
  const [savingPromotion, setSavingPromotion] = useState(false)

  const reload = () => startTransition(() => router.refresh())

  // ── Create goal ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("El título es requerido"); return }
    setSubmitting(true)
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internId, ...form, targetWeek: Number(form.targetWeek) }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Error")
      toast.success("Objetivo creado")
      setForm(emptyForm)
      setShowForm(false)
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear objetivo")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Quick status update ───────────────────────────────────────────────────
  const handleStatusChange = async (goalId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Error")
      toast.success("Estado actualizado")
      reload()
    } catch {
      toast.error("Error al actualizar estado")
    }
  }

  // ── Save inline edit ──────────────────────────────────────────────────────
  const handleSaveEdit = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Error")
      toast.success("Objetivo actualizado")
      setEditingId(null)
      reload()
    } catch {
      toast.error("Error al actualizar objetivo")
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (goalId: string) => {
    const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Error al eliminar")
    toast.success("Objetivo eliminado")
    reload()
  }

  // ── Promotion ─────────────────────────────────────────────────────────────
  const handleSavePromotion = async () => {
    setSavingPromotion(true)
    try {
      const res = await fetch(`/api/interns/${internId}/promotion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionRecommendation: promotion }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Error")
      toast.success("Recomendación guardada")
      reload()
    } catch {
      toast.error("Error al guardar recomendación")
    } finally {
      setSavingPromotion(false)
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const completed = initialGoals.filter((g) => g.status === "COMPLETED").length
  const inProgress = initialGoals.filter((g) => g.status === "IN_PROGRESS").length
  const total = initialGoals.length

  const promotionDisplay = promotionInfo(promotion ?? autoPromotion)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ── Left: Goals list ─────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: total, color: "text-text-primary" },
            { label: "En progreso", value: inProgress, color: "text-electric-400" },
            { label: "Completados", value: completed, color: "text-neon-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-base-600 bg-base-800 px-4 py-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add goal button */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Objetivos ({total})
          </h2>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Agregar objetivo
          </Button>
        </div>

        {/* New goal form */}
        {showForm && (
          <div className="rounded-2xl border border-electric-500/30 bg-base-800 p-5 space-y-4 shadow-card">
            <h3 className="text-sm font-semibold text-electric-400">Nuevo objetivo</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs text-text-tertiary mb-1">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Dominar React Hooks avanzados"
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-electric-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-text-tertiary mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Detalles del objetivo..."
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-electric-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Categoría *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Prioridad *</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                >
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Estado inicial</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-tertiary mb-1">Semana objetivo (1–{totalWeeks})</label>
                <input
                  type="number"
                  min={1}
                  max={totalWeeks}
                  value={form.targetWeek}
                  onChange={(e) => setForm((f) => ({ ...f, targetWeek: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-text-tertiary mb-1">Tecnología / herramienta (opcional)</label>
                <input
                  value={form.technology}
                  onChange={(e) => setForm((f) => ({ ...f, technology: e.target.value }))}
                  placeholder="Ej: React, Docker, Figma..."
                  className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-electric-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(emptyForm) }}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={submitting}>
                {submitting ? "Guardando..." : "Crear objetivo"}
              </Button>
            </div>
          </div>
        )}

        {/* Goals list */}
        {initialGoals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-600 p-12 text-center">
            <p className="text-text-tertiary text-sm">No hay objetivos asignados.</p>
            <p className="text-text-tertiary text-xs mt-1">Pulsa &ldquo;Agregar objetivo&rdquo; para empezar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialGoals.map((goal) => {
              const cat = categoryInfo(goal.category)
              const pri = priorityInfo(goal.priority)
              const st = statusInfo(goal.status)
              const Icon = st.icon
              const isEditing = editingId === goal.id

              return (
                <div
                  key={goal.id}
                  className={`rounded-xl border bg-base-800 transition-all ${
                    isEditing ? "border-electric-500/40 shadow-card" : "border-base-600 hover:border-base-500"
                  }`}
                >
                  {/* View mode */}
                  {!isEditing ? (
                    <div className="flex items-start gap-4 p-4">
                      <div className="mt-0.5">
                        <Icon className={`h-5 w-5 ${st.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-text-primary">{goal.title}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${cat.color}`}>
                            {cat.label}
                          </span>
                          <span className={`text-xs font-mono ${pri.color}`}>
                            {pri.label}
                          </span>
                          <span className="text-xs text-text-tertiary font-mono">S{goal.targetWeek}</span>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-text-secondary mb-2">{goal.description}</p>
                        )}
                        {/* Quick status select */}
                        <select
                          value={goal.status}
                          onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                          className={`text-xs rounded-md border border-base-600 bg-base-700 px-2 py-1 focus:border-electric-500 focus:outline-none ${st.color}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingId(goal.id); setEditForm({ ...goal }) }}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-base-700 transition-colors text-xs"
                        >
                          Editar
                        </button>
                        <ConfirmDialog
                          title="Eliminar objetivo"
                          description={`¿Eliminar "${goal.title}"? Esta acción no se puede deshacer.`}
                          confirmLabel="Eliminar"
                          danger
                          onConfirm={() => handleDelete(goal.id)}
                        >
                          <button className="p-1.5 rounded-lg text-text-tertiary hover:text-danger-400 hover:bg-danger-500/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </ConfirmDialog>
                      </div>
                    </div>
                  ) : (
                    /* Edit mode */
                    <div className="p-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-text-tertiary mb-1">Título</label>
                          <input
                            value={editForm.title ?? ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-text-tertiary mb-1">Descripción</label>
                          <textarea
                            value={editForm.description ?? ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                            rows={2}
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Categoría</label>
                          <select
                            value={editForm.category ?? "TECHNICAL"}
                            onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                          >
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Prioridad</label>
                          <select
                            value={editForm.priority ?? "MEDIUM"}
                            onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                          >
                            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Estado</label>
                          <select
                            value={editForm.status ?? "NOT_STARTED"}
                            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                          >
                            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-text-tertiary mb-1">Semana objetivo</label>
                          <input
                            type="number" min={1} max={totalWeeks}
                            value={editForm.targetWeek ?? 1}
                            onChange={(e) => setEditForm((f) => ({ ...f, targetWeek: Number(e.target.value) }))}
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-text-tertiary mb-1">Notas del mentor</label>
                          <textarea
                            value={editForm.notes ?? ""}
                            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={2}
                            placeholder="Notas de seguimiento..."
                            className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-electric-500 focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(goal.id)}>
                          Guardar cambios
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right: Promotion recommendation ──────────────────────────────── */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-base-600 bg-base-800 p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <h3 className="font-semibold text-text-primary">Recomendación</h3>
          </div>

          {/* Auto-calculated */}
          <div className="rounded-lg border border-base-600 bg-base-700/50 p-3">
            <p className="text-xs text-text-tertiary mb-1.5">Auto-calculada (basada en métricas)</p>
            <div className="space-y-1.5 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Score general</span>
                <span className="font-mono text-text-primary">{overallScore.toFixed(1)} / 20</span>
              </div>
              <div className="flex justify-between">
                <span>Asistencia</span>
                <span className="font-mono text-text-primary">{attendanceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tareas</span>
                <span className="font-mono text-text-primary">{taskCompletion}%</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-base-600">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${promotionDisplay?.color ?? promotionInfo(autoPromotion)?.color ?? "text-base-400"}`}>
                {promotionDisplay?.label ?? promotionInfo(autoPromotion)?.label ?? autoPromotion}
              </span>
            </div>
          </div>

          {/* Manual override */}
          <div>
            <p className="text-xs text-text-tertiary mb-1.5">Override manual (opcional)</p>
            <select
              value={promotion ?? ""}
              onChange={(e) => setPromotion(e.target.value || null)}
              className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-2 text-sm text-text-primary focus:border-electric-500 focus:outline-none"
            >
              <option value="">— Usar auto-calculada —</option>
              {PROMOTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {promotionDisplay && (
            <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${promotionDisplay.color}`}>
              ✓ Activa: {promotionDisplay.label}
            </div>
          )}

          <Button
            className="w-full"
            size="sm"
            onClick={handleSavePromotion}
            disabled={savingPromotion}
          >
            {savingPromotion ? "Guardando..." : "Guardar recomendación"}
          </Button>
        </div>

        {/* Progress ring */}
        {initialGoals.length > 0 && (
          <div className="rounded-2xl border border-base-600 bg-base-800 p-5 shadow-card">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Progreso de objetivos</h3>
            <div className="space-y-2">
              {STATUSES.map((s) => {
                const count = initialGoals.filter((g) => g.status === s.value).length
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={s.value}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={s.color}>{s.label}</span>
                      <span className="text-text-tertiary">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-base-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.value === "COMPLETED" ? "bg-neon-400" :
                          s.value === "IN_PROGRESS" ? "bg-electric-400" :
                          s.value === "PENDING" ? "bg-amber-400" :
                          s.value === "SKIPPED" ? "bg-base-500" : "bg-base-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
