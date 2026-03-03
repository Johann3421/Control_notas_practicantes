"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { toast } from "sonner"
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewInternPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
    university: "",
    stack: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/interns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al crear practicante")
      }

      toast.success("Practicante creado exitosamente")
      router.push("/mentor/interns")
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
        <Link href="/mentor/interns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Nuevo Practicante</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Registra un nuevo practicante en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-base-800 bg-base-900 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Datos de Usuario
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre completo"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="María García López"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="maria@example.com"
            />
          </div>
          <Input
            label="Contraseña inicial"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="rounded-2xl border border-base-800 bg-base-900 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Datos de Práctica
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Código"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              placeholder="INT-001"
            />
            <Input
              label="Universidad"
              name="university"
              value={form.university}
              onChange={handleChange}
              placeholder="Universidad Nacional"
            />
          </div>
          <Input
            label="Stack tecnológico"
            name="stack"
            value={form.stack}
            onChange={handleChange}
            placeholder="React, TypeScript, Node.js (separados por coma)"
          />
          <Input
            label="Fecha de inicio"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {submitting ? "Creando..." : "Crear Practicante"}
        </Button>
      </form>
    </div>
  )
}
