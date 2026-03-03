import { Zap } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10 ring-1 ring-electric/30">
            <Zap className="h-6 w-6 text-electric" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            DevTrack
          </h1>
          <p className="text-sm text-text-secondary">
            Mide el crecimiento. Acelera el talento.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
