"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import { toast } from "sonner"
import { ArrowLeft, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

interface InternOption {
  id: string
  name: string
  code: string
}

export default function NewTaskPage() {
  const router = useRouter()
  const [interns, setInterns] = useState<InternOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    internId: "",
    type: "FEATURE",
    priority: "MEDIUM",
    dueDate: "",
  })

  useEffect(() => {
    fetch("/api/evaluations?interns=true")
      .then((r) => r.json())
      .then((data) => setInterns(data.interns ?? []))
      .catch(() => toast.error("Error al cargar practicantes"))
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al crear tarea")
      }
      toast.success("Tarea creada exitosamente")
      router.push("/mentor/tasks")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/tasks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Nueva Tarea</h1>
          <p className="mt-1 text-sm text-text-secondary">Asigna una tarea a un practicante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6 space-y-4">
          <Input
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Implementar componente de login"
          />
          <Textarea
            label="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción detallada de la tarea..."
            rows={4}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Practicante
              </label>
              <select
                name="internId"
                value={form.internId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-base-700 bg-base-800 px-4 py-2.5 text-sm text-text-primary focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric"
              >
                <option value="">Seleccionar</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <Input
              label="Fecha de vencimiento"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {submitting ? "Creando..." : "Crear Tarea"}
        </Button>
      </form>
    </div>
  )
}
