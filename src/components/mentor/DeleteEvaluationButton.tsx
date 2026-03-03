"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"

interface DeleteEvaluationButtonProps {
  evaluationId: string
  internName: string
  weekNumber: number
}

export default function DeleteEvaluationButton({
  evaluationId,
  internName,
  weekNumber,
}: DeleteEvaluationButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/evaluations/${evaluationId}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "Error al eliminar evaluación")
      throw new Error(data.error)
    }
    toast.success(`Evaluación semana ${weekNumber} de "${internName}" eliminada`)
    router.refresh()
  }

  return (
    <ConfirmDialog
      title="¿Eliminar evaluación?"
      description={`Se eliminará la evaluación de la semana ${weekNumber} de "${internName}". Esta acción no se puede deshacer.`}
      confirmLabel="Sí, eliminar"
      onConfirm={handleDelete}
    >
      <button
        type="button"
        title="Eliminar evaluación"
        className="rounded-lg p-1.5 text-danger-400 border border-transparent hover:border-danger-500/30 hover:bg-danger-500/10 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </ConfirmDialog>
  )
}
