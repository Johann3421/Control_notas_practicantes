"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { LogIn, AlertCircle, Loader2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { loginAction } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      {pending ? "Verificando..." : "Ingresar"}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-base-800 bg-base-900 p-6 shadow-card space-y-5">
        <h2 className="text-lg font-semibold text-text-primary">
          Iniciar sesión
        </h2>

        {state?.error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="tu@correo.com"
          required
          autoComplete="email"
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <SubmitButton />
      </div>

      <p className="text-center text-xs text-text-tertiary">
        ¿Problemas para acceder? Contacta a tu mentor o administrador.
      </p>
    </form>
  )
}

