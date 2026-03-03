import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import ProgressBar from "@/components/ui/ProgressBar"
import { Plus } from "lucide-react"
import { scoreToColorClass } from "@/lib/utils"
import { calculateAttendanceRate } from "@/lib/scoring"
import DeleteInternButton from "@/components/mentor/DeleteInternButton"

export default async function MentorInternsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const interns = await prisma.intern.findMany({
    where: { mentorId: session.user.id },
    include: {
      user: true,
      attendance: true,
    },
    orderBy: { user: { name: "asc" } },
  })

  const totalWeeks = parseInt(process.env.NEXT_PUBLIC_INTERNSHIP_WEEKS ?? "12")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Practicantes</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {interns.length} practicante{interns.length !== 1 ? "s" : ""} asignado{interns.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/mentor/interns/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Agregar Practicante
          </Button>
        </Link>
      </div>

      {interns.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interns.map((intern: { id: string; code: string; status: string; stack: string[]; overallScore: unknown; currentWeek: number | null; user: { name: string | null; image: string | null }; attendance: { status: string }[] }) => {
            const attendance = calculateAttendanceRate(intern.attendance.map((a: { status: string }) => a.status))
            const weekProgress = intern.currentWeek ?? 1

            return (
              <div key={intern.id} className="group relative rounded-2xl border border-base-800 bg-base-900 transition-all hover:border-base-700 hover:shadow-card-hover">
                {/* Delete button – top right, shown on hover */}
                <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteInternButton internId={intern.id} internName={intern.user.name ?? intern.code} />
                </div>

                <Link href={`/mentor/interns/${intern.id}`} className="block p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={intern.user.name ?? ""} image={intern.user.image} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{intern.user.name}</p>
                      <p className="text-xs text-text-tertiary">{intern.code}</p>
                    </div>
                    <Badge variant={intern.status === "ACTIVE" ? "success" : "neutral"}>
                      {intern.status === "ACTIVE" ? "Activo" : intern.status}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {intern.stack.slice(0, 4).map((tech: string) => (
                      <span key={tech} className="rounded-md bg-base-800 px-2 py-0.5 text-xs text-text-secondary">
                        {tech}
                      </span>
                    ))}
                    {intern.stack.length > 4 && (
                      <span className="text-xs text-text-tertiary">+{intern.stack.length - 4}</span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Score</span>
                      <span className={`font-mono font-semibold ${scoreToColorClass(Number(intern.overallScore))}`}>
                        {Number(intern.overallScore).toFixed(1)}
                      </span>
                    </div>
                    <ProgressBar value={Number(intern.overallScore)} max={20} color="electric" size="sm" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
                    <span>Semana {weekProgress}/{totalWeeks}</span>
                    <span>Asistencia: {attendance}%</span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-base-800 bg-base-900">
          <p className="text-text-tertiary">No tienes practicantes asignados.</p>
        </div>
      )}
    </div>
  )
}
