"use client"

import { useState } from "react"
import { toast } from "sonner"
import { User, Lock, Save, Eye, EyeOff } from "lucide-react"

interface ProfileFormProps {
  initialName: string
  email: string
}

export default function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden")
      return
    }
    if (newPassword && newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Error al guardar cambios")
        return
      }
      toast.success("Perfil actualizado correctamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-base-600 bg-base-800 p-6 shadow-card space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-500/15">
          <User className="h-4 w-4 text-electric-400" />
        </div>
        <h3 className="font-semibold text-text-primary">Información personal</h3>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
          Nombre completo
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-base-600 bg-base-700 px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-colors"
        />
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-xl border border-base-600 bg-base-900/50 px-4 py-2.5 text-sm text-text-tertiary cursor-not-allowed"
        />
        <p className="text-xs text-text-tertiary">El correo no puede modificarse</p>
      </div>

      {/* Password change */}
      <div className="border-t border-base-600 pt-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-text-tertiary" />
          <span className="text-sm font-medium text-text-secondary">Cambiar contraseña</span>
          <span className="text-xs text-text-tertiary">(opcional)</span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
            Contraseña actual
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-base-600 bg-base-700 px-4 py-2.5 pr-10 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-colors"
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-base-600 bg-base-700 px-4 py-2.5 pr-10 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-colors"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
            Confirmar nueva contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contraseña"
            className="w-full rounded-xl border border-base-600 bg-base-700 px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-electric-500/15 border border-electric-500/30 px-4 py-2.5 text-sm font-semibold text-electric-400 hover:bg-electric-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="h-4 w-4" />
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  )
}
