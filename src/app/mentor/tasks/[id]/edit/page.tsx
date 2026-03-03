"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import { toast } from "sonner"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "FEATURE",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
  })

  useEffect(() => {
    fetch(`/api/tasks?id=${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.task) {
          setForm({
            title: data.task.title,
            description: data.task.description ?? "",
            type: data.task.type,
            priority: data.task.priority,
            status: data.task.status,
            dueDate: data.task.dueDate?.split("T")[0] ?? "",
          })
        }
      })
      .catch(() => toast.error("Error al cargar tarea"))
      .finally(() => setLoading(false))
  }, [taskId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Tarea actualizada")
      router.push("/mentor/tasks")
      router.refresh()
    } catch {
      toast.error("Error al actualizar tarea")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta tarea?")) return
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Tarea eliminada")
      router.push("/mentor/tasks")
      router.refresh()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-electric" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/mentor/tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar Tarea</h1>
        </div>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6 space-y-4">
          <Input
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <Textarea
            label="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Tipo"
              name="type"
              value={form.type}
              onChange={handleChange}
              options={[
                { value: "FEATURE", label: "Feature" },
                { value: "BUG_FIX", label: "Bug Fix" },
                { value: "RESEARCH", label: "Research" },
                { value: "DOCUMENTATION", label: "Documentación" },
                { value: "REFACTOR", label: "Refactor" },
                { value: "TESTING", label: "Testing" },
              ]}
            />
            <Select
              label="Prioridad"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              options={[
                { value: "LOW", label: "Baja" },
                { value: "MEDIUM", label: "Media" },
                { value: "HIGH", label: "Alta" },
                { value: "CRITICAL", label: "Crítica" },
              ]}
            />
            <Select
              label="Estado"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: "TODO", label: "Por Hacer" },
                { value: "IN_PROGRESS", label: "En Progreso" },
                { value: "IN_REVIEW", label: "En Revisión" },
                { value: "DONE", label: "Completada" },
              ]}
            />
          </div>
          <Input
            label="Fecha de vencimiento"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </div>
  )
}
