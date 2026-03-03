"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, MessageSquare, CheckSquare, Calendar, LogOut, Terminal, Settings } from "lucide-react"
import Avatar from "@/components/ui/Avatar"

interface InternSidebarProps {
  internName: string
  internEmail: string
}

const links = [
  { href: "/intern", label: "Mi Dashboard", icon: LayoutDashboard },
  { href: "/intern/roadmap", label: "Mi Roadmap", icon: Map },
  { href: "/intern/feedback", label: "Mi Feedback", icon: MessageSquare },
  { href: "/intern/tasks", label: "Mis Tareas", icon: CheckSquare },
  { href: "/intern/attendance", label: "Mi Asistencia", icon: Calendar },
]

export default function InternSidebar({ internName, internEmail }: InternSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-base-900 border-r border-base-600 h-screen sticky top-0">
        <div className="p-6 border-b border-base-600">
          <Link href="/intern" className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-electric-400" />
            <span className="font-mono text-lg font-bold text-electric-400">DevTrack</span>
          </Link>
          <p className="mt-1 text-xs text-text-tertiary">Mide el crecimiento. Acelera el talento.</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-electric-500/15 text-electric-400 border border-electric-500/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-base-700"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-base-600 space-y-3">
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-base-700 transition-colors"
          >
            <Avatar name={internName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{internName}</p>
              <p className="font-mono text-xs text-text-code truncate">{internEmail}</p>
            </div>
            <Settings className="w-4 h-4 shrink-0 opacity-60" />
          </Link>
          <div className="flex items-center justify-between px-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-electric-500/15 text-electric-400 font-mono text-xs border border-electric-500/30">
              INTERN
            </span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="p-1.5 text-text-tertiary hover:text-danger-400 rounded-lg hover:bg-base-700 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-900 border-t border-base-600 px-2 py-1">
        <div className="flex justify-around">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs ${
                  isActive ? "text-electric-400" : "text-text-tertiary"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="truncate max-w-15">{link.label.replace("Mi ", "")}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
