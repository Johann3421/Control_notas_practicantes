import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import MentorSidebar from "@/components/mentor/MentorSidebar"

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || (session.user.role !== "MENTOR" && session.user.role !== "ADMIN")) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-base-950">
      <MentorSidebar
        mentorName={session.user.name ?? "Mentor"}
        mentorEmail={session.user.email ?? ""}
      />
      <main className="flex-1 md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
