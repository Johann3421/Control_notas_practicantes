import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./_components/ProfileForm"
import AppearanceForm from "./_components/AppearanceForm"
import Avatar from "@/components/ui/Avatar"

export default async function SettingsProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    MENTOR: "Mentor",
    INTERN: "Practicante",
  }

  const roleBadge: Record<string, string> = {
    ADMIN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    MENTOR: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    INTERN: "bg-electric-500/15 text-electric-400 border-electric-500/30",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
        <p className="mt-1 text-sm text-text-secondary">Gestiona tu perfil y preferencias de apariencia</p>
      </div>

      {/* Profile header */}
      <div className="flex items-center gap-5 rounded-2xl border border-base-600 bg-base-800 p-6 shadow-card">
        <Avatar name={session.user.name ?? ""} image={session.user.image} size="xl" />
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{session.user.name}</h2>
          <p className="text-sm text-text-tertiary">{session.user.email}</p>
          <span className={`mt-2 inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs ${roleBadge[session.user.role ?? "INTERN"]}`}>
            {roleLabel[session.user.role ?? "INTERN"]}
          </span>
        </div>
      </div>

      {/* Grid: profile + appearance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm
          initialName={session.user.name ?? ""}
          email={session.user.email ?? ""}
        />
        <AppearanceForm />
      </div>
    </div>
  )
}
