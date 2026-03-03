"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogIn, AlertCircle, Loader2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()

      // Ensure we have a fresh CSRF token (some browsers or contexts may not set the cookie automatically).
      let csrfToken = undefined as string | undefined
      try {
        const res = await fetch('/api/auth/csrf', { credentials: 'include' })
        const json = await res.json()
        csrfToken = json?.csrfToken
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Could not fetch CSRF token before signIn', err)
      }

      // Try manual POST to credentials callback to ensure cookies are sent
      try {
        const params = new URLSearchParams()
        if (csrfToken) params.append('csrfToken', csrfToken)
        params.append('email', normalizedEmail)
        params.append('password', password)

        const postRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          body: params,
          credentials: 'include',
        })

        // Check session endpoint to confirm login succeeded
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' })
        const sessionJson = await sessionRes.json()
        // (no debug logs)

        if (sessionJson?.user?.email) {
          router.push('/')
          router.refresh()
        } else {
          // If manual POST didn't result in a session, fall back to signIn to get provider error
          const fallback = await signIn('credentials', { email: normalizedEmail, password, csrfToken, redirect: false })
          // (no debug logs)
          setError(fallback?.error ?? 'Credenciales inválidas. Intenta de nuevo.')
        }
      } catch (err) {
        // (no debug logs)
        setError('Error al iniciar sesión. Intenta de nuevo más tarde.')
      }
    } catch {
      setError("Error al conectar con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-base-800 bg-base-900 p-6 shadow-card space-y-5">
        <h2 className="text-lg font-semibold text-text-primary">
          Iniciar sesión
        </h2>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {loading ? "Verificando..." : "Ingresar"}
        </Button>
      </div>

      <p className="text-center text-xs text-text-tertiary">
        ¿Problemas para acceder? Contacta a tu mentor o administrador.
      </p>
    </form>
  )
}
