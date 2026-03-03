"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, startTransition } from "react"
import { Moon, Sun, CloudMoon, Check } from "lucide-react"

const THEMES = [
  {
    id: "dark",
    label: "Oscuro",
    description: "Negro profundo, ideal para trabajar de noche",
    icon: Moon,
    preview: {
      bg: "#0a0e1a",
      surface: "#161c2e",
      border: "#28304a",
      text: "#f1f5f9",
      accent: "#3b82f6",
    },
  },
  {
    id: "dim",
    label: "Atenuado",
    description: "Gris oscuro, suave para los ojos",
    icon: CloudMoon,
    preview: {
      bg: "#0f172a",
      surface: "#1e293b",
      border: "#334155",
      text: "#f1f5f9",
      accent: "#3b82f6",
    },
  },
  {
    id: "light",
    label: "Claro",
    description: "Fondo blanco, perfecto para entornos luminosos",
    icon: Sun,
    preview: {
      bg: "#f8fafc",
      surface: "#ffffff",
      border: "#e2e8f0",
      text: "#0f172a",
      accent: "#3b82f6",
    },
  },
]

export default function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => setMounted(true))
  }, [])

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-base-600 bg-base-800 p-6 shadow-card animate-pulse h-64" />
    )
  }

  return (
    <div className="rounded-2xl border border-base-600 bg-base-800 p-6 shadow-card space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
          <Sun className="h-4 w-4 text-violet-400" />
        </div>
        <h3 className="font-semibold text-text-primary">Apariencia</h3>
      </div>
      <p className="text-sm text-text-secondary">Elige el tema que mejor se adapte a tu entorno de trabajo</p>

      <div className="space-y-3">
        {THEMES.map((t) => {
          const isActive = theme === t.id
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`group w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-electric-500/50 bg-electric-500/10"
                  : "border-base-600 hover:border-base-500 hover:bg-base-700/50"
              }`}
            >
              {/* Mini preview */}
              <div
                className="shrink-0 rounded-lg overflow-hidden w-16 h-10 border"
                style={{ backgroundColor: t.preview.bg, borderColor: t.preview.border }}
              >
                <div
                  className="m-1.5 rounded h-3"
                  style={{ backgroundColor: t.preview.surface, border: `1px solid ${t.preview.border}` }}
                />
                <div className="mx-1.5 flex gap-1">
                  <div className="rounded h-1.5 flex-1" style={{ backgroundColor: t.preview.accent, opacity: 0.8 }} />
                  <div className="rounded h-1.5 w-4" style={{ backgroundColor: t.preview.border }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-text-secondary" />
                  <span className={`text-sm font-medium ${isActive ? "text-electric-400" : "text-text-primary"}`}>
                    {t.label}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5 truncate">{t.description}</p>
              </div>

              {isActive && (
                <div className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-electric-500/20 border border-electric-500/40">
                  <Check className="h-3 w-3 text-electric-400" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-text-tertiary border-t border-base-600 pt-4">
        La preferencia se guarda en tu navegador y se aplica automáticamente.
      </p>
    </div>
  )
}
