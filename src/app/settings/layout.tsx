import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Terminal } from "lucide-react"

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  const backHref =
    session.user.role === "INTERN" ? "/intern" :
    session.user.role === "ADMIN" ? "/admin" :
    "/mentor"

  return (
    <div className="min-h-screen bg-base-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-base-600 bg-base-900/80 backdrop-blur">
        <div className="mx-auto max-w-4xl flex items-center gap-4 px-4 py-3 sm:px-6">
          <Link href={backHref} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-text-secondary hover:bg-base-700 hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-electric-400" />
            <span className="font-mono text-base font-bold text-electric-400">DevTrack</span>
          </div>
          <span className="text-text-tertiary text-sm ml-1">/ Configuración</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  )
}
