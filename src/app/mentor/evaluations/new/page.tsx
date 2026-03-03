"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import EvaluationForm from "@/components/mentor/EvaluationForm"
import { toast } from "sonner"

interface InternOption {
  id: string
  name: string
  code: string
}

export default function NewEvaluationPage() {
  const router = useRouter()
  const [interns, setInterns] = useState<InternOption[]>([])
  const [selectedIntern, setSelectedIntern] = useState("")
  const [weekNumber, setWeekNumber] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/evaluations?interns=true")
      .then((r) => r.json())
      .then((data) => setInterns(data.interns ?? []))
      .catch(() => toast.error("Error al cargar practicantes"))
  }, [])

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!selectedIntern) {
      toast.error("Selecciona un practicante")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: selectedIntern,
          weekNumber,
          ...formData,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al guardar")
      }
      toast.success("Evaluación guardada exitosamente")
      router.push("/mentor/evaluations")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar evaluación")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nueva Evaluación</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Evalúa el progreso semanal de un practicante
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Practicante
          </label>
          <select
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            className="w-full rounded-xl border border-base-700 bg-base-800 px-4 py-2.5 text-sm text-text-primary focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric"
          >
            <option value="">Seleccionar practicante</option>
            {interns.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Semana #
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
            className="w-full rounded-xl border border-base-700 bg-base-800 px-4 py-2.5 text-sm text-text-primary focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric"
          />
        </div>
      </div>

      <EvaluationForm
        internId={selectedIntern}
        weekNumber={weekNumber}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}
