"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void>
  children: React.ReactNode // trigger button
  danger?: boolean
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Eliminar",
  onConfirm,
  children,
  danger = true,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger */}
      <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}>
        {children}
      </span>

      {/* Backdrop + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !loading && setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border border-base-600 bg-base-800 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              disabled={loading}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-text-tertiary hover:bg-base-700 hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              danger ? "bg-danger-500/15" : "bg-electric-500/15"
            }`}>
              <AlertTriangle className={`h-6 w-6 ${danger ? "text-danger-400" : "text-electric-400"}`} />
            </div>

            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{description}</p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-xl border border-base-600 bg-base-700 px-4 py-2 text-sm text-text-secondary hover:bg-base-600 hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  danger
                    ? "bg-danger-500/15 text-danger-400 border border-danger-500/30 hover:bg-danger-500/25"
                    : "bg-electric-500/15 text-electric-400 border border-electric-500/30 hover:bg-electric-500/25"
                }`}
              >
                {loading ? "Eliminando…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
