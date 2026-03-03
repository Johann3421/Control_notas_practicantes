"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"

interface DeleteInternButtonProps {
  internId: string
  internName: string
}

export default function DeleteInternButton({ internId, internName }: DeleteInternButtonProps) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/interns/${internId}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "Error al eliminar practicante")
      throw new Error(data.error)
    }
    toast.success(`Practicante "${internName}" eliminado`)
    router.refresh()
  }

  return (
    <ConfirmDialog
      title="¿Eliminar practicante?"
      description={`Esto eliminará permanentemente a "${internName}" junto con todas sus evaluaciones, asistencia y tareas. Esta acción no se puede deshacer.`}
      confirmLabel="Sí, eliminar"
      onConfirm={handleDelete}
    >
      <button
        type="button"
        title="Eliminar practicante"
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-danger-400 border border-transparent hover:border-danger-500/30 hover:bg-danger-500/10 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Eliminar
      </button>
    </ConfirmDialog>
  )
}
